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

import type {
  GraphAdapter, QueryResult, GraphSchema, GraphPayload,
  ExploreOptions, SchemaOptions, GraphNode, GraphEdge,
} from './base.js';
import { parseTarget, toCypherLiteral } from './base.js';

// Type for the kuzu module — we import dynamically to avoid crash if not installed
type KuzuModule = {
  Database: new (path: string) => KuzuDB;
  Connection: new (db: KuzuDB) => KuzuConn;
};
type KuzuDB = object;
type KuzuConn = {
  execute(query: string, params?: Record<string, unknown>): Promise<KuzuResult>;
};
type KuzuResult = {
  getColumnNames(): string[];
  hasNext(): boolean;
  getNext(): Record<string, unknown>;
  getAllAsync(): Promise<Record<string, unknown>[]>;
};

export class KuzuAdapter implements GraphAdapter {
  private db: KuzuDB | null = null;
  private conn: KuzuConn | null = null;
  private kuzu: KuzuModule | null = null;

  constructor(private readonly dbPath: string) {}

  async connect(): Promise<void> {
    // Dynamic import — if kuzu isn't installed, give a helpful error
    try {
      // @ts-ignore
      this.kuzu = await import('kuzu') as unknown as KuzuModule;
    } catch (_) {
      throw new Error(
        'Kuzu package not found. Install it: npm install kuzu\n' +
        'On macOS, you may need: brew install cmake llvm && npm install kuzu'
      );
    }

    const { Database, Connection } = this.kuzu!;
    this.db = new Database(this.dbPath);
    this.conn = new Connection(this.db);
    console.error(`[kuzu] Connected to database at: ${this.dbPath}`);
  }

  async disconnect(): Promise<void> {
    // Kuzu cleans up on GC but we null references to help
    this.conn = null;
    this.db = null;
  }

  async query(cypher: string, parameters: Record<string, unknown> = {}): Promise<QueryResult> {
    if (!this.conn) throw new Error('Not connected. Call connect() first.');

    const result = await this.conn.execute(cypher, parameters);
    const columns = result.getColumnNames();
    const rows: Record<string, unknown>[] = [];

    // Stream rows — Kuzu uses lazy materialization internally
    while (result.hasNext()) {
      const row = await result.getNext() as Record<string, unknown>;
      // Normalize Kuzu's internal node objects to plain objects with properties
      const normalizedRow: Record<string, unknown> = {};
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
  private normalizeValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object' && value !== null) {
      const v = value as Record<string, unknown>;
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
      const result: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        result[k] = this.normalizeValue(val);
      }
      return result;
    }
    return value;
  }

  async getSchema(options: SchemaOptions = {}): Promise<GraphSchema> {
    if (!this.conn) throw new Error('Not connected.');
    const { includeCounts = true } = options;

    // Kuzu exposes its catalog via CALL functions
    const nodeTablesResult = await this.query('CALL show_tables() RETURN *', {});
    const nodeTypes = [];
    const relTypes = [];

    for (const row of nodeTablesResult.rows) {
      const tableName = row['name'] as string;
      const tableType = row['type'] as string;

      // Get column info for this table
      let propResult: QueryResult;
      try {
        propResult = await this.query(`CALL table_info('${tableName}') RETURN *`, {});
      } catch (_) {
        propResult = { columns: [], rows: [] };
      }
      
      const properties: Record<string, string> = {};
      let primaryKey: string | undefined;
      for (const propRow of propResult.rows) {
        properties[propRow['name'] as string] = propRow['type'] as string;
        if (propRow['primary_key']) primaryKey = propRow['name'] as string;
      }

      let count: number | undefined;
      if (includeCounts) {
        try {
          const countResult = await this.query(`MATCH (n:${tableName}) RETURN COUNT(*) AS cnt`, {});
          count = countResult.rows[0]?.cnt as number;
        } catch (_) { /* table might be a rel table */ }
      }

      if (tableType === 'NODE') {
        nodeTypes.push({ name: tableName, properties, primaryKey, count });
      } else if (tableType === 'REL') {
        // Get FROM/TO for rel tables
        const relInfoResult = await this.query(`CALL show_connection('${tableName}') RETURN *`, {});
        for (const connRow of relInfoResult.rows) {
          relTypes.push({
            name: tableName,
            fromType: connRow['source_table_name'] as string,
            toType: connRow['destination_table_name'] as string,
            properties,
            count,
          });
        }
      }
    }

    return { nodeTypes, relTypes };
  }

  async explore(target: string, options: ExploreOptions = {}): Promise<GraphPayload> {
    if (!this.conn) throw new Error('Not connected.');
    const {
      hops = 2, edgeTypes, filters = {},
      direction = 'both', limit = 5000,
    } = options;

    const { anchorCypher, alias } = parseTarget(target);

    // Build the relationship direction pattern
    const relTypeClause = edgeTypes?.length ? `:${edgeTypes.join('|')}` : '';
    let relPattern: string;
    switch (direction) {
      case 'out':  relPattern = `-[r${relTypeClause}*1..${hops}]->`;  break;
      case 'in':   relPattern = `<-[r${relTypeClause}*1..${hops}]-`;  break;
      default:     relPattern = `-[r${relTypeClause}*1..${hops}]-`;   break;
    }

    // Build property filters on destination nodes
    const filterClauses = Object.entries(filters)
      .map(([k, v]) => `end.${k} = ${toCypherLiteral(v)}`)
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

    let result: QueryResult;
    try {
      result = await this.query(explorationQuery, {});
    } catch (e) {
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
  private pathResultToPayload(result: QueryResult, _anchorAlias: string): GraphPayload {
    const nodeMap = new Map<string, GraphNode>();
    const edgeMap = new Map<string, GraphEdge>();

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

  private extractFromValue(
    value: unknown,
    nodeMap: Map<string, GraphNode>,
    edgeMap: Map<string, GraphEdge>
  ): void {
    if (!value || typeof value !== 'object') return;
    const v = value as Record<string, unknown>;

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
    } else if (v.__type === 'relationship') {
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
    } else if (Array.isArray(value)) {
      for (const item of value as unknown[]) {
        this.extractFromValue(item, nodeMap, edgeMap);
      }
    } else {
      // Recurse into nested objects (e.g., path objects)
      for (const nested of Object.values(v)) {
        this.extractFromValue(nested, nodeMap, edgeMap);
      }
    }
  }

  async explain(query: string): Promise<Record<string, unknown>> {
    // Kuzu supports EXPLAIN as a prefix
    const result = await this.query(`EXPLAIN ${query}`, {});
    return { plan: result.rows, columns: result.columns };
  }
}
