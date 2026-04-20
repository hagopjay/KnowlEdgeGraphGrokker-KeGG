/**
 * keg-grokker Real-Time Visualization Server
 *
 * A lightweight Express + WebSocket server that:
 *   1. Serves a self-contained D3.js force-directed graph UI (index.html)
 *   2. Accepts graph data pushes via WebSocket broadcasts
 *   3. Maintains a current graph state (for new client connections)
 *   4. Exposes a /snapshot endpoint for saving graph state
 *   5. Tracks layout preferences, highlights, and view state
 *
 * Architecture:
 *   MCP tool call → VizServer.push() → WebSocket broadcast → Browser D3.js
 */
import type { GraphPayload, GraphNode, GraphEdge } from './adapters/base.js';
interface VizServerOptions {
    port: number;
    pluginRoot: string;
    autoOpen?: boolean;
}
interface PushOptions {
    layout?: string;
    merge?: boolean;
    title?: string;
    highlightIds?: string[];
    centerOn?: string;
}
export declare class VizServer {
    private app;
    private server;
    private wss;
    private clients;
    private startTime;
    readonly port: number;
    private readonly pluginRoot;
    private readonly autoOpen;
    private state;
    constructor(options: VizServerOptions);
    private setupRoutes;
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    /**
     * Push graph data to all connected clients and update internal state.
     * If merge=true, new nodes/edges are added to existing; merge=false replaces.
     */
    push(payload: GraphPayload, options?: PushOptions): void;
    private broadcast;
    private serializeState;
    snapshot(): {
        nodes: GraphNode[];
        edges: GraphEdge[];
        layout: string;
        title: string | undefined;
        highlights: string[];
        centerOn: string | undefined;
    };
    status(): {
        running: boolean;
        port: number;
        uptime_ms: number;
        clients: number;
        node_count: number;
        edge_count: number;
        url: string;
    };
    /**
     * Self-contained fallback UI — rendered if ui/index.html is missing.
     * The real UI (ui/index.html) is more feature-rich but this works standalone.
     */
    private getInlineUI;
}
export {};
//# sourceMappingURL=viz-server.d.ts.map