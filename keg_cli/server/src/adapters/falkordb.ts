/**
 * FalkorDB Graph Database Adapter
 * 
 * FalkorDB is a Redis module that adds graph capabilities via the RedisGraph API.
 * It uses openCypher and exposes a Redis-compatible interface.
 * 
 * OSS: https://github.com/FalkorDB/FalkorDB
 * Run locally: docker run -p 6379:6379 falkordb/falkordb
 * 
 * FalkorDB query results come back as arrays of arrays, not named maps —
 * we align them against the header row to produce named records.
 */

import type {
  GraphAdapter, QueryResult, GraphSchema, GraphPayload,
  ExploreOptions, SchemaOptions, GraphNode, GraphEdge,
} from './base.js';
import { parseTarget, toCypherLiteral } from './base.js';

// FalkorDB client type stubs (falkordb npm package)
type FalkorClient = {
  selectGraph(name: string): FalkorGraph;
  quit(): Promise<void>;
};
type FalkorGraph = {
  query(cypher: string): Promise<FalkorResult>;
  roQuery(cypher: string): Promise<FalkorResult>;
};
type FalkorResult = {
  header: string[];
  data: unknown[][];
  metadata?: string[];
};

const DEFAULT_GRAPH = 'keg_default';

export class FalkorDBAdapter implements GraphAdapter {
  private client: FalkorClient | null = null;
  private graph: FalkorGraph | null = null;
  private graphName: string;

  constructor(
    private readonly host: string = 'localhost',
    private readonly port: number = 6379,
    graphName: string = DEFAULT_GRAPH
  ) {
    this.graphName = graphName;
  }

  async connect(): Promise<void> {
    let FalkorDB: { createClient(opts: { socket: { host: string; port: number } }): FalkorClient };
    try {
      FalkorDB = await import('falkordb') as unknown as typeof FalkorDB;
    } catch (_) {
      throw new Error(
        'falkordb package not found. Install: npm install falkordb\n' +
        'Make sure FalkorDB (or Redis with FalkorDB module) is running:\n' +
        '  docker run -p 6379:6379 falkordb/falkordb'
      );
    }

    this.client = FalkorDB.createClient({ socket: { host: this.host, port: this.port } });
    this.graph = this.client.selectGraph(this.graphName);
    console.error(`[falkordb] Connected to ${this.host}:${this.port} graph="${this.graphName}"`);
  }

  async disconnect(): Promise<void> {
    await this.client?.quit();
    this.client = null;
    this.graph = null;
  }

  setGraph(graphName: string): void {
    if (!this.client) throw new Error('Not connected.');
    this.graphName = graphName;
    this.graph = this.client.selectGraph(graphName);
  }

  async query(cypher: string, _parameters: Record<string, unknown> = {}): Promise<QueryResult> {
    if (!this.graph) throw new Error('Not connected. Call connect() first.');

    // FalkorDB doesn't support native parameterized queries in the same way —
    // parameters are interpolated into the query string server-side.
    // Note: FalkorDB DOES have a parameter format but it varies by client version.
    const isWrite = /^\s*(CREATE|MERGE|DELETE|SET|REMOVE|DROP)/i.test(cypher);
    const result = isWrite
      ? await this.graph.query(cypher)
      : await this.graph.roQuery(cypher);

    const columns = result.header ?? [];
    const rows = (result.data ?? []).map(rowArray => {
      const row: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        row[col] = this.normalizeValue((rowArray as unknown[])[idx]);
      });
      return row;
    });

    return { columns, rows };
  }

  private normalizeValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;

    // FalkorDB Node: { id, labels, properties }
    if (typeof value === 'object' && value !== null) {
      const v = value as Record<string, unknown>;
      if ('labels' in v && 'id' in v && 'properties' in v) {
        const labels = v.labels as string[];
        const props = this.normalizeProperties(v.properties as Record<string, unknown>);
        return {
          __type: 'node',
          id: String(v.id),
          label: labels[0] ?? 'Node',
          ...props,
        };
      }
      // FalkorDB Relationship: { id, type, src_node, dest_node, properties }
      if ('type' in v && 'src_node' in v && 'dest_node' in v) {
        const props = this.normalizeProperties(v.properties as Record<string, unknown>);
        return {
          __type: 'relationship',
          id: String(v.id),
          type: v.type,
          src: String(v.src_node),
          dst: String(v.dest_node),
          ...props,
        };
      }
      // FalkorDB Path: { nodes, edges }
      if ('nodes' in v && 'edges' in v) {
        return {
          __type: 'path',
          nodes: (v.nodes as unknown[]).map(n => this.normalizeValue(n)),
          edges: (v.edges as unknown[]).map(e => this.normalizeValue(e)),
        };
      }
      const result: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        result[k] = this.normalizeValue(val);
      }
      return result;
    }

    if (Array.isArray(value)) return value.map(v => this.normalizeValue(v));
    return value;
  }

  private normalizeProperties(props: Record<string, unknown>): Record<string, unknown> {
    if (!props) return {};
    return Object.fromEntries(
      Object.entries(props).map(([k, v]) => [k, this.normalizeValue(v)])
    );
  }

  async getSchema(options: SchemaOptions = {}): Promise<GraphSchema> {
    const { includeCounts = true } = options;

    // FalkorDB exposes schema via CALL procedures
    let nodeLabels: string[] = [];
    let relTypes: string[] = [];

    try {
      const nlResult = await this.query('CALL db.labels() YIELD label RETURN label', {});
      nodeLabels = nlResult.rows.map(r => String(r.label));
    } catch (_) {
      // Older FalkorDB versions
      const nlResult = await this.query('MATCH (n) RETURN DISTINCT labels(n)[0] AS label', {});
      nodeLabels = nlResult.rows.map(r => String(r.label)).filter(Boolean);
    }

    try {
      const rtResult = await this.query('CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType', {});
      relTypes = rtResult.rows.map(r => String(r.relationshipType));
    } catch (_) {
      const rtResult = await this.query('MATCH ()-[r]->() RETURN DISTINCT type(r) AS t', {});
      relTypes = rtResult.rows.map(r => String(r.t)).filter(Boolean);
    }

    // Get property keys per label (sample approach)
    const nodeTypesFull = await Promise.all(nodeLabels.map(async label => {
      const propResult = await this.query(
        `MATCH (n:${label}) RETURN keys(n) AS props LIMIT 100`, {}
      );
      const allKeys = new Set<string>();
      for (const row of propResult.rows) {
        for (const key of (row.props as string[] ?? [])) allKeys.add(key);
      }
      const properties: Record<string, string> = {};
      for (const key of allKeys) properties[key] = 'ANY';

      let count: number | undefined;
      if (includeCounts) {
        const cr = await this.query(`MATCH (n:${label}) RETURN COUNT(n) AS cnt`, {});
        count = cr.rows[0]?.cnt as number;
      }
      return { name: label, properties, count };
    }));

    const relTypesFull = await Promise.all(relTypes.map(async type => {
      const propResult = await this.query(
        `MATCH ()-[r:${type}]->() RETURN keys(r) AS props LIMIT 100`, {}
      );
      const allKeys = new Set<string>();
      for (const row of propResult.rows) {
        for (const key of (row.props as string[] ?? [])) allKeys.add(key);
      }
      const properties: Record<string, string> = {};
      for (const key of allKeys) properties[key] = 'ANY';

      // Get FROM/TO types
      const connResult = await this.query(
        `MATCH (a)-[:${type}]->(b) RETURN DISTINCT labels(a)[0] AS from_label, labels(b)[0] AS to_label LIMIT 5`,
        {}
      );
      return {
        name: type,
        fromType: (connResult.rows[0]?.from_label as string) ?? '?',
        toType: (connResult.rows[0]?.to_label as string) ?? '?',
        properties,
      };
    }));

    return { nodeTypes: nodeTypesFull, relTypes: relTypesFull };
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

    // FalkorDB supports shortestPath but not variable-length RETURN path as a path object.
    // We return nodes and relationships separately.
    const explorationQuery = `
      ${anchorCypher}
      MATCH (${alias})${relPattern}(end)
      ${whereClause}
      RETURN ${alias}, r, end
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
        for (const n of (v.nodes as unknown[])) processValue(n);
        for (const e of (v.edges as unknown[])) processValue(e);
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
    try {
      const result = await this.query(`EXPLAIN ${query}`, {});
      return { plan: result.rows };
    } catch (_) {
      return { note: 'EXPLAIN not available in this FalkorDB version' };
    }
  }
}
