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
    properties: Record<string, string>;
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
export declare function parseTarget(target: string): {
    anchorCypher: string;
    alias: string;
};
/** Serialize any value to a Cypher literal string */
export declare function toCypherLiteral(value: unknown): string;
//# sourceMappingURL=base.d.ts.map