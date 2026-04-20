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
import type { GraphAdapter, QueryResult, GraphSchema, GraphPayload, ExploreOptions, SchemaOptions } from './base.js';
export declare class Neo4jAdapter implements GraphAdapter {
    private readonly uri;
    private readonly username;
    private readonly password;
    private driver;
    constructor(uri: string, username: string, password: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(cypher: string, parameters?: Record<string, unknown>): Promise<QueryResult>;
    /** Neo4j returns its own Integer type, Node type, Relationship type — normalize them all */
    private normalizeNeo4jValue;
    private normalizeProperties;
    getSchema(options?: SchemaOptions): Promise<GraphSchema>;
    explore(target: string, options?: ExploreOptions): Promise<GraphPayload>;
    private resultToPayload;
    explain(query: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=neo4j.d.ts.map