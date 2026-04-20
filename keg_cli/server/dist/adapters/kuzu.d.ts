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
import type { GraphAdapter, QueryResult, GraphSchema, GraphPayload, ExploreOptions, SchemaOptions } from './base.js';
export declare class KuzuAdapter implements GraphAdapter {
    private readonly dbPath;
    private db;
    private conn;
    private kuzu;
    constructor(dbPath: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(cypher: string, parameters?: Record<string, unknown>): Promise<QueryResult>;
    /**
     * Normalize Kuzu's internal value types to JSON-serializable forms.
     * Kuzu returns Node objects with {_label, _id, ...properties} and
     * Relationship objects with {_src, _dst, _rel, ...properties}.
     */
    private normalizeValue;
    getSchema(options?: SchemaOptions): Promise<GraphSchema>;
    explore(target: string, options?: ExploreOptions): Promise<GraphPayload>;
    /**
     * Convert Kuzu path query results into a normalized graph payload.
     * Deduplicates nodes and edges across multiple paths.
     */
    private pathResultToPayload;
    private extractFromValue;
    explain(query: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=kuzu.d.ts.map