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
import type { GraphAdapter, QueryResult, GraphSchema, GraphPayload, ExploreOptions, SchemaOptions } from './base.js';
export declare class FalkorDBAdapter implements GraphAdapter {
    private readonly host;
    private readonly port;
    private client;
    private graph;
    private graphName;
    constructor(host?: string, port?: number, graphName?: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    setGraph(graphName: string): void;
    query(cypher: string, _parameters?: Record<string, unknown>): Promise<QueryResult>;
    private normalizeValue;
    private normalizeProperties;
    getSchema(options?: SchemaOptions): Promise<GraphSchema>;
    explore(target: string, options?: ExploreOptions): Promise<GraphPayload>;
    private resultToPayload;
    explain(query: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=falkordb.d.ts.map