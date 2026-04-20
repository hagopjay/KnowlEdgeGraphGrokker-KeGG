/**
 * Base GraphAdapter interface.
 * Every database backend (Kuzu, Neo4j, FalkorDB, future adapters)
 * implements this contract. The MCP server calls only these methods,
 * so adding a new database is purely additive — no MCP code changes needed.
 */

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface SchemaNodeType {
  name: string;
  properties: Record<string, string>;   // property name → Kuzu/Cypher type
  primaryKey?: string;
  count?: number;
  sampleValues?: Record<string, unknown[]>;
}

export interface SchemaRelType {
  name: string;
  fromType: string;
  toType: string;
  properties: Record<string, string>;
  count?: number;
}

export interface GraphSchema {
  nodeTypes: SchemaNodeType[];
  relTypes: SchemaRelType[];
  indexes?: string[];
  constraints?: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, unknown>;
  color?: string;
  size?: number;
  group?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, unknown>;
  color?: string;
  width?: number;
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ExploreOptions {
  hops?: number;
  edgeTypes?: string[];
  filters?: Record<string, unknown>;
  direction?: 'out' | 'in' | 'both';
  limit?: number;
}

export interface SchemaOptions {
  sampleData?: boolean;
  includeCounts?: boolean;
}

export interface GraphAdapter {
  /** Establish the database connection */
  connect(): Promise<void>;

  /** Close the connection and free resources */
  disconnect(): Promise<void>;

  /** Execute a Cypher-family query and return rows */
  query(cypher: string, parameters: Record<string, unknown>): Promise<QueryResult>;

  /** Retrieve the schema (node types, relationship types, properties) */
  getSchema(options?: SchemaOptions): Promise<GraphSchema>;

  /** Expand a node's neighborhood N hops and return a graph payload */
  explore(target: string, options?: ExploreOptions): Promise<GraphPayload>;

  /** Get the query execution plan (EXPLAIN) */
  explain(query: string): Promise<Record<string, unknown>>;
}

/**
 * Parse a "target" string into a Cypher anchor pattern.
 * 
 * Handles these formats:
 *   - "42"              → MATCH (n) WHERE id(n) = 42
 *   - "Person:42"       → MATCH (n:Person {id: 42})
 *   - "Person:name:Alice" → MATCH (n:Person {name: 'Alice'})
 *   - "MATCH ..."       → used as-is (user-supplied Cypher anchor)
 */
export function parseTarget(target: string): { anchorCypher: string; alias: string } {
  const alias = 'start_node';

  if (/^\s*MATCH\s/i.test(target)) {
    // User supplied raw Cypher — wrap it for use as an anchor
    return { anchorCypher: target, alias };
  }

  const parts = target.split(':');

  if (parts.length === 1 && /^\d+$/.test(target.trim())) {
    // Bare numeric ID
    return { anchorCypher: `MATCH (${alias}) WHERE id(${alias}) = ${parseInt(target, 10)}`, alias };
  }

  if (parts.length === 2 && /^\d+$/.test(parts[1].trim())) {
    // Label:numericId
    const [label, id] = parts;
    return { anchorCypher: `MATCH (${alias}:${label.trim()} {id: ${parseInt(id.trim(), 10)}})`, alias };
  }

  if (parts.length === 3) {
    // Label:property:value
    const [label, prop, value] = parts;
    const valClause = /^\d+$/.test(value.trim()) ? value.trim() : `'${value.trim()}'`;
    return { anchorCypher: `MATCH (${alias}:${label.trim()} {${prop.trim()}: ${valClause}})`, alias };
  }

  // Fall back: treat as a label name, find the first node with that label
  return { anchorCypher: `MATCH (${alias}:${target.trim()})`, alias };
}

/** Serialize any value to a Cypher literal string */
export function toCypherLiteral(value: unknown): string {
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return 'null';
  return `'${JSON.stringify(value)}'`;
}
