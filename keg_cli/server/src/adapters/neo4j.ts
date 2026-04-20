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

import type {
  GraphAdapter, QueryResult, GraphSchema, GraphPayload,
  ExploreOptions, SchemaOptions, GraphNode, GraphEdge,
} from './base.js';
import { parseTarget, toCypherLiteral } from './base.js';

type Neo4jDriver = {
  session(): Neo4jSession;
  close(): Promise<void>;
};
type Neo4jSession = {
  run(cypher: string, params?: Record<string, unknown>): Promise<Neo4jResult>;
  close(): Promise<void>;
};
type Neo4jResult = {
  records: Neo4jRecord[];
};
type Neo4jRecord = {
  keys: (string | number)[];
  get(key: string): unknown;
};

export class Neo4jAdapter implements GraphAdapter {
  private driver: Neo4jDriver | null = null;

  constructor(
    private readonly uri: string,
    private readonly username: string,
    private readonly password: string
  ) {}

  async connect(): Promise<void> {
    const neo4j = await import('neo4j-driver');
    this.driver = neo4j.default.driver(
      this.uri,
      neo4j.default.auth.basic(this.username, this.password)
    );
    // Verify connectivity immediately so errors surface at connect time
    await (this.driver as unknown as { verifyConnectivity(): Promise<void> }).verifyConnectivity();
    console.error(`[neo4j] Connected to ${this.uri}`);
  }

  async disconnect(): Promise<void> {
    await this.driver?.close();
    this.driver = null;
  }

  async query(cypher: string, parameters: Record<string, unknown> = {}): Promise<QueryResult> {
    if (!this.driver) throw new Error('Not connected.');
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, parameters);
      const columns = result.records[0]?.keys ?? [];
      const rows = result.records.map(record =>
        Object.fromEntries(columns.map(col => [col, this.normalizeNeo4jValue(record.get(col as string))]))
      );
      return { columns: columns as string[], rows };
    } finally {
      await session.close();
    }
  }

  /** Neo4j returns its own Integer type, Node type, Relationship type — normalize them all */
  private normalizeNeo4jValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    
    // Neo4j Integer
    if (typeof value === 'object' && value !== null && 'low' in value && 'high' in value) {
      return Number((value as { low: number; high: number }).low);
    }
    
    // Neo4j Node object
    if (typeof value === 'object' && value !== null && 'labels' in value && 'properties' in value) {
      const node = value as { identity: { low: number }; labels: string[]; properties: Record<string, unknown> };
      return {
        __type: 'node',
        id: String(node.identity.low),
        label: node.labels[0] ?? 'Node',
        ...this.normalizeProperties(node.properties),
      };
    }
    
    // Neo4j Relationship
    if (typeof value === 'object' && value !== null && 'type' in value && 'start' in value && 'end' in value) {
      const rel = value as { identity: { low: number }; type: string; start: { low: number }; end: { low: number }; properties: Record<string, unknown> };
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
      const path = value as { segments: unknown[] };
      return { __type: 'path', segments: path.segments.map(s => this.normalizeNeo4jValue(s)) };
    }
    
    if (Array.isArray(value)) return value.map(v => this.normalizeNeo4jValue(v));
    
    return value;
  }

  private normalizeProperties(props: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(props).map(([k, v]) => [k, this.normalizeNeo4jValue(v)])
    );
  }

  async getSchema(options: SchemaOptions = {}): Promise<GraphSchema> {
    const { includeCounts = true } = options;

    // Neo4j 4+ exposes schema via CALL db.schema.nodeTypeProperties()
    const nodePropsResult = await this.query('CALL db.schema.nodeTypeProperties() YIELD nodeType, propertyName, propertyTypes', {});
    const relPropsResult = await this.query('CALL db.schema.relTypeProperties() YIELD relType, propertyName, propertyTypes', {});

    // Group by label
    const nodeMap = new Map<string, Record<string, string>>();
    for (const row of nodePropsResult.rows) {
      const label = String(row.nodeType ?? '').replace(':`', '').replace('`', '');
      if (!nodeMap.has(label)) nodeMap.set(label, {});
      nodeMap.get(label)![String(row.propertyName)] = String(Array.isArray(row.propertyTypes) ? row.propertyTypes[0] : row.propertyTypes);
    }

    const nodeTypes = await Promise.all(Array.from(nodeMap.entries()).map(async ([name, properties]) => {
      let count: number | undefined;
      if (includeCounts) {
        try {
          const r = await this.query(`MATCH (n:${name}) RETURN COUNT(*) AS cnt`, {});
          count = r.rows[0]?.cnt as number;
        } catch (_) {}
      }
      return { name, properties, count };
    }));

    const relMap = new Map<string, Record<string, string>>();
    for (const row of relPropsResult.rows) {
      const type = String(row.relType ?? '').replace(':`', '').replace('`', '');
      if (!relMap.has(type)) relMap.set(type, {});
      relMap.get(type)![String(row.propertyName)] = String(Array.isArray(row.propertyTypes) ? row.propertyTypes[0] : row.propertyTypes);
    }

    // Get FROM/TO for rel types via schema visualization procedure
    const relConnResult = await this.query('CALL db.schema.visualization() YIELD relationships RETURN relationships', {});
    const relTypes = [];
    for (const [name, properties] of relMap.entries()) {
      relTypes.push({ name, fromType: '?', toType: '?', properties });
    }

    return { nodeTypes, relTypes };
  }

  async explore(target: string, options: ExploreOptions = {}): Promise<GraphPayload> {
    const { hops = 2, edgeTypes, filters = {}, direction = 'both', limit = 5000 } = options;
    const { anchorCypher, alias } = parseTarget(target);

    const relClause = edgeTypes?.length ? `:${edgeTypes.join('|')}` : '';
    const dirLeft = direction === 'out' ? '' : '<';
    const dirRight = direction === 'in' ? '' : '>';
    const relPattern = `${dirLeft}-[r${relClause}*1..${hops}]-${dirRight}`;

    const filterClauses = Object.entries(filters)
      .map(([k, v]) => `end.${k} = ${toCypherLiteral(v)}`)
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

  private resultToPayload(result: QueryResult): GraphPayload {
    const nodeMap = new Map<string, GraphNode>();
    const edgeMap = new Map<string, GraphEdge>();

    const processValue = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      const v = value as Record<string, unknown>;
      if (v.__type === 'node') {
        const { __type, id, label, ...props } = v;
        nodeMap.set(String(id), { id: String(id), label: String(label), properties: props });
      } else if (v.__type === 'relationship') {
        const { __type, id, type, src, dst, ...props } = v;
        edgeMap.set(String(id), { id: String(id), source: String(src), target: String(dst), type: String(type), properties: props });
      } else if (v.__type === 'path') {
        for (const seg of (v.segments as unknown[])) processValue(seg);
      } else {
        for (const nested of Object.values(v)) processValue(nested);
      }
    };

    for (const row of result.rows) {
      for (const val of Object.values(row)) processValue(val);
    }

    return { nodes: Array.from(nodeMap.values()), edges: Array.from(edgeMap.values()) };
  }

  async explain(query: string): Promise<Record<string, unknown>> {
    const result = await this.query(`EXPLAIN ${query}`, {});
    return { plan: result.rows };
  }
}
