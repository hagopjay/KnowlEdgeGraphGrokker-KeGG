"use strict";
/**
 * Neo4j Graph Database Adapter
 *
 * Uses the official Neo4j JavaScript driver (Bolt protocol).
 * Neo4j is the most widely deployed graph database — this adapter
 * also works with AuraDB (Neo4j cloud) by changing the URI.
 *
 * Important: Neo4j's type system uses Integer objects for large numbers —
 * we convert those to JS numbers or strings to ensure JSON serializability.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neo4jAdapter = void 0;
const base_js_1 = require("./base.js");
class Neo4jAdapter {
    uri;
    username;
    password;
    driver = null;
    constructor(uri, username, password) {
        this.uri = uri;
        this.username = username;
        this.password = password;
    }
    async connect() {
        const neo4j = await Promise.resolve().then(() => __importStar(require('neo4j-driver')));
        this.driver = neo4j.default.driver(this.uri, neo4j.default.auth.basic(this.username, this.password));
        // Verify connectivity immediately so errors surface at connect time
        await this.driver.verifyConnectivity();
        console.error(`[neo4j] Connected to ${this.uri}`);
    }
    async disconnect() {
        await this.driver?.close();
        this.driver = null;
    }
    async query(cypher, parameters = {}) {
        if (!this.driver)
            throw new Error('Not connected.');
        const session = this.driver.session();
        try {
            const result = await session.run(cypher, parameters);
            const columns = result.records[0]?.keys ?? [];
            const rows = result.records.map(record => Object.fromEntries(columns.map(col => [col, this.normalizeNeo4jValue(record.get(col))])));
            return { columns: columns, rows };
        }
        finally {
            await session.close();
        }
    }
    /** Neo4j returns its own Integer type, Node type, Relationship type — normalize them all */
    normalizeNeo4jValue(value) {
        if (value === null || value === undefined)
            return null;
        // Neo4j Integer
        if (typeof value === 'object' && value !== null && 'low' in value && 'high' in value) {
            return Number(value.low);
        }
        // Neo4j Node object
        if (typeof value === 'object' && value !== null && 'labels' in value && 'properties' in value) {
            const node = value;
            return {
                __type: 'node',
                id: String(node.identity.low),
                label: node.labels[0] ?? 'Node',
                ...this.normalizeProperties(node.properties),
            };
        }
        // Neo4j Relationship
        if (typeof value === 'object' && value !== null && 'type' in value && 'start' in value && 'end' in value) {
            const rel = value;
            return {
                __type: 'relationship',
                id: String(rel.identity.low),
                type: rel.type,
                src: String(rel.start.low),
                dst: String(rel.end.low),
                ...this.normalizeProperties(rel.properties),
            };
        }
        // Neo4j Path
        if (typeof value === 'object' && value !== null && 'segments' in value) {
            const path = value;
            return { __type: 'path', segments: path.segments.map(s => this.normalizeNeo4jValue(s)) };
        }
        if (Array.isArray(value))
            return value.map(v => this.normalizeNeo4jValue(v));
        return value;
    }
    normalizeProperties(props) {
        return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, this.normalizeNeo4jValue(v)]));
    }
    async getSchema(options = {}) {
        const { includeCounts = true } = options;
        // Neo4j 4+ exposes schema via CALL db.schema.nodeTypeProperties()
        const nodePropsResult = await this.query('CALL db.schema.nodeTypeProperties() YIELD nodeType, propertyName, propertyTypes', {});
        const relPropsResult = await this.query('CALL db.schema.relTypeProperties() YIELD relType, propertyName, propertyTypes', {});
        // Group by label
        const nodeMap = new Map();
        for (const row of nodePropsResult.rows) {
            const label = String(row.nodeType ?? '').replace(':`', '').replace('`', '');
            if (!nodeMap.has(label))
                nodeMap.set(label, {});
            nodeMap.get(label)[String(row.propertyName)] = String(Array.isArray(row.propertyTypes) ? row.propertyTypes[0] : row.propertyTypes);
        }
        const nodeTypes = await Promise.all(Array.from(nodeMap.entries()).map(async ([name, properties]) => {
            let count;
            if (includeCounts) {
                try {
                    const r = await this.query(`MATCH (n:${name}) RETURN COUNT(*) AS cnt`, {});
                    count = r.rows[0]?.cnt;
                }
                catch (_) { }
            }
            return { name, properties, count };
        }));
        const relMap = new Map();
        for (const row of relPropsResult.rows) {
            const type = String(row.relType ?? '').replace(':`', '').replace('`', '');
            if (!relMap.has(type))
                relMap.set(type, {});
            relMap.get(type)[String(row.propertyName)] = String(Array.isArray(row.propertyTypes) ? row.propertyTypes[0] : row.propertyTypes);
        }
        // Get FROM/TO for rel types via schema visualization procedure
        const relConnResult = await this.query('CALL db.schema.visualization() YIELD relationships RETURN relationships', {});
        const relTypes = [];
        for (const [name, properties] of relMap.entries()) {
            relTypes.push({ name, fromType: '?', toType: '?', properties });
        }
        return { nodeTypes, relTypes };
    }
    async explore(target, options = {}) {
        const { hops = 2, edgeTypes, filters = {}, direction = 'both', limit = 5000 } = options;
        const { anchorCypher, alias } = (0, base_js_1.parseTarget)(target);
        const relClause = edgeTypes?.length ? `:${edgeTypes.join('|')}` : '';
        const dirLeft = direction === 'out' ? '' : '<';
        const dirRight = direction === 'in' ? '' : '>';
        const relPattern = `${dirLeft}-[r${relClause}*1..${hops}]-${dirRight}`;
        const filterClauses = Object.entries(filters)
            .map(([k, v]) => `end.${k} = ${(0, base_js_1.toCypherLiteral)(v)}`)
            .join(' AND ');
        const whereClause = filterClauses ? `WHERE ${filterClauses}` : '';
        const explorationQuery = `
      ${anchorCypher}
      MATCH path = (${alias})${relPattern}(end)
      ${whereClause}
      RETURN path
      LIMIT ${limit}
    `;
        const result = await this.query(explorationQuery, {});
        return this.resultToPayload(result);
    }
    resultToPayload(result) {
        const nodeMap = new Map();
        const edgeMap = new Map();
        const processValue = (value) => {
            if (!value || typeof value !== 'object')
                return;
            const v = value;
            if (v.__type === 'node') {
                const { __type, id, label, ...props } = v;
                nodeMap.set(String(id), { id: String(id), label: String(label), properties: props });
            }
            else if (v.__type === 'relationship') {
                const { __type, id, type, src, dst, ...props } = v;
                edgeMap.set(String(id), { id: String(id), source: String(src), target: String(dst), type: String(type), properties: props });
            }
            else if (v.__type === 'path') {
                for (const seg of v.segments)
                    processValue(seg);
            }
            else {
                for (const nested of Object.values(v))
                    processValue(nested);
            }
        };
        for (const row of result.rows) {
            for (const val of Object.values(row))
                processValue(val);
        }
        return { nodes: Array.from(nodeMap.values()), edges: Array.from(edgeMap.values()) };
    }
    async explain(query) {
        const result = await this.query(`EXPLAIN ${query}`, {});
        return { plan: result.rows };
    }
}
exports.Neo4jAdapter = Neo4jAdapter;
//# sourceMappingURL=neo4j.js.map