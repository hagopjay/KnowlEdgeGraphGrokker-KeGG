"use strict";
/**
 * Kuzu Graph Database Adapter
 *
 * Kuzu is an embedded, high-performance graph DB (like SQLite for graphs).
 * It uses its own Cypher dialect — almost fully compatible with openCypher
 * but with some differences noted inline.
 *
 * Key Kuzu characteristics to know:
 *  - Strongly typed schema (you define tables before loading data)
 *  - Column-oriented storage with worst-case optimal join execution
 *  - Embedded: no server process, just a directory on disk
 *  - GIL is released during queries in the Python binding
 *  - Node/rel IDs are internal offsets (not user-visible by default)
 *  - Use PRIMARY KEY properties as your node identifiers
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
exports.KuzuAdapter = void 0;
const base_js_1 = require("./base.js");
class KuzuAdapter {
    dbPath;
    db = null;
    conn = null;
    kuzu = null;
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    async connect() {
        // Dynamic import — if kuzu isn't installed, give a helpful error
        try {
            // @ts-ignore
            this.kuzu = await Promise.resolve().then(() => __importStar(require('kuzu')));
        }
        catch (_) {
            throw new Error('Kuzu package not found. Install it: npm install kuzu\n' +
                'On macOS, you may need: brew install cmake llvm && npm install kuzu');
        }
        const { Database, Connection } = this.kuzu;
        this.db = new Database(this.dbPath);
        this.conn = new Connection(this.db);
        console.error(`[kuzu] Connected to database at: ${this.dbPath}`);
    }
    async disconnect() {
        // Kuzu cleans up on GC but we null references to help
        this.conn = null;
        this.db = null;
    }
    async query(cypher, parameters = {}) {
        if (!this.conn)
            throw new Error('Not connected. Call connect() first.');
        const result = await this.conn.execute(cypher, parameters);
        const columns = result.getColumnNames();
        const rows = [];
        // Stream rows — Kuzu uses lazy materialization internally
        while (result.hasNext()) {
            const row = await result.getNext();
            // Normalize Kuzu's internal node objects to plain objects with properties
            const normalizedRow = {};
            for (const col of columns) {
                normalizedRow[col] = this.normalizeValue(row[col]);
            }
            rows.push(normalizedRow);
        }
        return { columns, rows };
    }
    /**
     * Normalize Kuzu's internal value types to JSON-serializable forms.
     * Kuzu returns Node objects with {_label, _id, ...properties} and
     * Relationship objects with {_src, _dst, _rel, ...properties}.
     */
    normalizeValue(value) {
        if (value === null || value === undefined)
            return null;
        if (typeof value === 'object' && value !== null) {
            const v = value;
            // Kuzu Node object
            if ('_label' in v && '_id' in v) {
                const { _label, _id, ...props } = v;
                return { __type: 'node', label: _label, id: String(_id), ...props };
            }
            // Kuzu Relationship object
            if ('_src' in v && '_dst' in v) {
                const { _src, _dst, _rel, ...props } = v;
                return { __type: 'relationship', src: _src, dst: _dst, type: _rel, ...props };
            }
            // Nested object (e.g. MAP type in Kuzu)
            const result = {};
            for (const [k, val] of Object.entries(v)) {
                result[k] = this.normalizeValue(val);
            }
            return result;
        }
        return value;
    }
    async getSchema(options = {}) {
        if (!this.conn)
            throw new Error('Not connected.');
        const { includeCounts = true } = options;
        // Kuzu exposes its catalog via CALL functions
        const nodeTablesResult = await this.query('CALL show_tables() RETURN *', {});
        const nodeTypes = [];
        const relTypes = [];
        for (const row of nodeTablesResult.rows) {
            const tableName = row['name'];
            const tableType = row['type'];
            // Get column info for this table
            let propResult;
            try {
                propResult = await this.query(`CALL table_info('${tableName}') RETURN *`, {});
            }
            catch (_) {
                propResult = { columns: [], rows: [] };
            }
            const properties = {};
            let primaryKey;
            for (const propRow of propResult.rows) {
                properties[propRow['name']] = propRow['type'];
                if (propRow['primary_key'])
                    primaryKey = propRow['name'];
            }
            let count;
            if (includeCounts) {
                try {
                    const countResult = await this.query(`MATCH (n:${tableName}) RETURN COUNT(*) AS cnt`, {});
                    count = countResult.rows[0]?.cnt;
                }
                catch (_) { /* table might be a rel table */ }
            }
            if (tableType === 'NODE') {
                nodeTypes.push({ name: tableName, properties, primaryKey, count });
            }
            else if (tableType === 'REL') {
                // Get FROM/TO for rel tables
                const relInfoResult = await this.query(`CALL show_connection('${tableName}') RETURN *`, {});
                for (const connRow of relInfoResult.rows) {
                    relTypes.push({
                        name: tableName,
                        fromType: connRow['source_table_name'],
                        toType: connRow['destination_table_name'],
                        properties,
                        count,
                    });
                }
            }
        }
        return { nodeTypes, relTypes };
    }
    async explore(target, options = {}) {
        if (!this.conn)
            throw new Error('Not connected.');
        const { hops = 2, edgeTypes, filters = {}, direction = 'both', limit = 5000, } = options;
        const { anchorCypher, alias } = (0, base_js_1.parseTarget)(target);
        // Build the relationship direction pattern
        const relTypeClause = edgeTypes?.length ? `:${edgeTypes.join('|')}` : '';
        let relPattern;
        switch (direction) {
            case 'out':
                relPattern = `-[r${relTypeClause}*1..${hops}]->`;
                break;
            case 'in':
                relPattern = `<-[r${relTypeClause}*1..${hops}]-`;
                break;
            default:
                relPattern = `-[r${relTypeClause}*1..${hops}]-`;
                break;
        }
        // Build property filters on destination nodes
        const filterClauses = Object.entries(filters)
            .map(([k, v]) => `end.${k} = ${(0, base_js_1.toCypherLiteral)(v)}`)
            .join(' AND ');
        const whereClause = filterClauses ? `WHERE ${filterClauses}` : '';
        // Note: Kuzu's variable-length path with RETURN path captures all intermediate nodes.
        // We query for both the direct path and intermediate nodes via UNWIND.
        const explorationQuery = `
      ${anchorCypher}
      MATCH path = (${alias})${relPattern}(end)
      ${whereClause}
      RETURN path
      LIMIT ${limit}
    `;
        let result;
        try {
            result = await this.query(explorationQuery, {});
        }
        catch (e) {
            // If variable-length failed (e.g., typed schema restriction), fall back to 1-hop
            const fallbackQuery = `
        ${anchorCypher}
        MATCH (${alias})-[r]->(end)
        RETURN ${alias}, r, end
        LIMIT ${limit}
      `;
            result = await this.query(fallbackQuery, {});
        }
        return this.pathResultToPayload(result, alias);
    }
    /**
     * Convert Kuzu path query results into a normalized graph payload.
     * Deduplicates nodes and edges across multiple paths.
     */
    pathResultToPayload(result, _anchorAlias) {
        const nodeMap = new Map();
        const edgeMap = new Map();
        for (const row of result.rows) {
            // Each row contains path objects — walk through them
            for (const value of Object.values(row)) {
                this.extractFromValue(value, nodeMap, edgeMap);
            }
        }
        return {
            nodes: Array.from(nodeMap.values()),
            edges: Array.from(edgeMap.values()),
        };
    }
    extractFromValue(value, nodeMap, edgeMap) {
        if (!value || typeof value !== 'object')
            return;
        const v = value;
        if (v.__type === 'node') {
            const nodeId = String(v.id);
            if (!nodeMap.has(nodeId)) {
                const { __type, label, id, ...props } = v;
                nodeMap.set(nodeId, {
                    id: nodeId,
                    label: String(label),
                    properties: props,
                });
            }
        }
        else if (v.__type === 'relationship') {
            const edgeId = `${v.src}->${v.dst}:${v.type}`;
            if (!edgeMap.has(edgeId)) {
                const { __type, src, dst, type, ...props } = v;
                edgeMap.set(edgeId, {
                    id: edgeId,
                    source: String(src),
                    target: String(dst),
                    type: String(type),
                    properties: props,
                });
            }
        }
        else if (Array.isArray(value)) {
            for (const item of value) {
                this.extractFromValue(item, nodeMap, edgeMap);
            }
        }
        else {
            // Recurse into nested objects (e.g., path objects)
            for (const nested of Object.values(v)) {
                this.extractFromValue(nested, nodeMap, edgeMap);
            }
        }
    }
    async explain(query) {
        // Kuzu supports EXPLAIN as a prefix
        const result = await this.query(`EXPLAIN ${query}`, {});
        return { plan: result.rows, columns: result.columns };
    }
}
exports.KuzuAdapter = KuzuAdapter;
//# sourceMappingURL=kuzu.js.map