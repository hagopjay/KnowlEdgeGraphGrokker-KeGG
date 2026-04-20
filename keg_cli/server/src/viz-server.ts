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

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
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

interface VizMessage {
  type: 'graph_update' | 'layout_change' | 'highlight' | 'center' | 'reset' | 'ping';
  payload?: unknown;
}

interface GraphState {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  layout: string;
  title?: string;
  highlights: Set<string>;
  centerOn?: string;
}

export class VizServer {
  private app: express.Express;
  private server: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();
  private startTime: number | null = null;
  public readonly port: number;
  private readonly pluginRoot: string;
  private readonly autoOpen: boolean;

  // Live graph state — merged incrementally as pushes come in
  private state: GraphState = {
    nodes: new Map(),
    edges: new Map(),
    layout: 'force',
    highlights: new Set(),
  };

  constructor(options: VizServerOptions) {
    this.port = options.port;
    this.pluginRoot = options.pluginRoot;
    this.autoOpen = options.autoOpen ?? true;
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));

    // Serve the visualization UI
    this.app.get('/', (_req, res) => {
      const uiPath = path.join(this.pluginRoot, 'ui', 'index.html');
      if (fs.existsSync(uiPath)) {
        res.sendFile(uiPath);
      } else {
        // Inline fallback if ui/index.html not found
        res.send(this.getInlineUI());
      }
    });

    // Current graph state (for new clients or snapshotting)
    this.app.get('/state', (_req, res) => {
      res.json(this.serializeState());
    });

    // Snapshot endpoint — returns full current state as JSON
    this.app.get('/snapshot', (_req, res) => {
      res.json({
        timestamp: new Date().toISOString(),
        graph: this.serializeState(),
        client_count: this.clients.size,
      });
    });

    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', uptime: this.startTime ? Date.now() - this.startTime : 0 });
    });

    // Accept graph pushes via HTTP too (for agents that prefer REST over WebSocket)
    this.app.post('/push', (req, res) => {
      const { nodes = [], edges = [], ...options } = req.body as GraphPayload & PushOptions;
      this.push({ nodes, edges }, options as PushOptions);
      res.json({ pushed: { nodes: nodes.length, edges: edges.length } });
    });
  }

  async start(): Promise<void> {
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.error(`[viz] Client connected (${this.clients.size} total)`);

      // Send current state to new client immediately
      ws.send(JSON.stringify({
        type: 'graph_update',
        payload: { ...this.serializeState(), merge: false },
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.error(`[viz] Client disconnected (${this.clients.size} remaining)`);
      });

      ws.on('error', (err) => {
        console.error('[viz] WebSocket error:', err.message);
        this.clients.delete(ws);
      });

      // Keep-alive pings every 30s
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.listen(this.port, () => {
        this.startTime = Date.now();
        console.error(`[viz] Visualization server running at http://localhost:${this.port}`);
        resolve();
      });
      this.server!.on('error', reject);
    });

    if (this.autoOpen) {
      try {
        const { default: open } = await import('open');
        await open(`http://localhost:${this.port}`);
      } catch (_) {
        console.error(`[viz] Could not auto-open browser. Visit: http://localhost:${this.port}`);
      }
    }
  }

  async stop(): Promise<void> {
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    await new Promise<void>((resolve) => {
      this.wss?.close(() => {
        this.server?.close(() => {
          this.server = null;
          this.wss = null;
          this.startTime = null;
          resolve();
        });
      });
    });
  }

  isRunning(): boolean {
    return this.server !== null && this.startTime !== null;
  }

  /**
   * Push graph data to all connected clients and update internal state.
   * If merge=true, new nodes/edges are added to existing; merge=false replaces.
   */
  push(payload: GraphPayload, options: PushOptions = {}): void {
    const { layout = 'force', merge = true, title, highlightIds, centerOn } = options;

    if (!merge) {
      this.state.nodes.clear();
      this.state.edges.clear();
      this.state.highlights.clear();
    }

    // Merge nodes
    for (const node of payload.nodes) {
      this.state.nodes.set(node.id, node);
    }

    // Merge edges (deduplicate by source+target+type)
    for (const edge of payload.edges) {
      const edgeKey = edge.id ?? `${edge.source}->${edge.target}:${edge.type}`;
      this.state.edges.set(edgeKey, { ...edge, id: edgeKey });
    }

    this.state.layout = layout;
    if (title) this.state.title = title;
    if (highlightIds) {
      this.state.highlights = new Set(highlightIds);
    }
    if (centerOn) this.state.centerOn = centerOn;

    const message: VizMessage = {
      type: 'graph_update',
      payload: {
        nodes: payload.nodes,
        edges: payload.edges,
        layout,
        merge,
        title,
        highlightIds,
        centerOn,
        stats: {
          total_nodes: this.state.nodes.size,
          total_edges: this.state.edges.size,
        },
      },
    };

    this.broadcast(message);
  }

  private broadcast(message: VizMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  private serializeState() {
    return {
      nodes: Array.from(this.state.nodes.values()),
      edges: Array.from(this.state.edges.values()),
      layout: this.state.layout,
      title: this.state.title,
      highlights: Array.from(this.state.highlights),
      centerOn: this.state.centerOn,
    };
  }

  snapshot() {
    return this.serializeState();
  }

  status() {
    return {
      running: this.isRunning(),
      port: this.port,
      uptime_ms: this.startTime ? Date.now() - this.startTime : 0,
      clients: this.clients.size,
      node_count: this.state.nodes.size,
      edge_count: this.state.edges.size,
      url: `http://localhost:${this.port}`,
    };
  }

  /**
   * Self-contained fallback UI — rendered if ui/index.html is missing.
   * The real UI (ui/index.html) is more feature-rich but this works standalone.
   */
  private getInlineUI(): string {
    return `<!DOCTYPE html>
<html><head><title>keg-grokker — Graph Visualization</title>
<style>body{margin:0;background:#0d1117;color:#c9d1d9;font-family:monospace;}
#info{position:fixed;top:10px;left:10px;background:rgba(13,17,23,.9);padding:8px 12px;border-radius:4px;font-size:12px;border:1px solid #30363d;}
#status{position:fixed;top:10px;right:10px;background:rgba(13,17,23,.9);padding:8px 12px;border-radius:4px;font-size:12px;border:1px solid #30363d;}
svg{width:100vw;height:100vh;}
.node{cursor:pointer;}.node circle{stroke:#30363d;stroke-width:1.5px;}
.link{stroke-opacity:0.6;}.node text{font-size:10px;fill:#8b949e;}</style>
</head><body>
<div id="info">keg-grokker viz · <span id="counts">0 nodes, 0 edges</span></div>
<div id="status" id="ws-status">⟳ connecting...</div>
<svg id="graph"></svg>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
const COLORS=['#58a6ff','#3fb950','#f78166','#d2a8ff','#ffa657','#79c0ff','#56d364'];
const svg=d3.select('#graph');
const g=svg.append('g');
svg.call(d3.zoom().scaleExtent([.05,10]).on('zoom',e=>g.attr('transform',e.transform)));
let nodes=[],links=[],sim,nodeMap={};

function colorFor(label){const h=(label||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0);return COLORS[h%COLORS.length];}

function render(data){
  if(!data.merge){nodes=[];links=[];nodeMap={};}
  (data.nodes||[]).forEach(n=>{if(!nodeMap[n.id]){nodeMap[n.id]=n;nodes.push(n);}});
  (data.edges||[]).forEach(e=>{links.push({...e,source:e.source,target:e.target});});
  document.getElementById('counts').textContent=\`\${nodes.length} nodes, \${links.length} edges\`;
  draw();
}

function draw(){
  if(sim)sim.stop();
  const w=window.innerWidth,h=window.innerHeight;
  g.selectAll('*').remove();
  const link=g.append('g').selectAll('line').data(links).join('line')
    .attr('class','link').attr('stroke',d=>d.color||'#30363d').attr('stroke-width',d=>d.width||1.5);
  const node=g.append('g').selectAll('g').data(nodes).join('g').attr('class','node').call(
    d3.drag().on('start',dragstart).on('drag',dragged).on('end',dragend));
  node.append('circle').attr('r',d=>d.size||(d.properties?._degree?Math.min(4+Math.sqrt(d.properties._degree),20):6))
    .attr('fill',d=>d.color||colorFor(d.label)).attr('class','node-circle');
  node.append('text').text(d=>(d.properties?.name||d.properties?.id||d.label||d.id).toString().slice(0,20))
    .attr('dx',8).attr('dy',4);
  node.append('title').text(d=>JSON.stringify(d.properties,null,2));
  sim=d3.forceSimulation(nodes).force('link',d3.forceLink(links).id(d=>d.id).distance(60))
    .force('charge',d3.forceManyBody().strength(-120)).force('center',d3.forceCenter(w/2,h/2))
    .force('collision',d3.forceCollide(14));
  sim.on('tick',()=>{
    link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform',d=>\`translate(\${d.x},\${d.y})\`);
  });
}

function dragstart(e,d){if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;}
function dragged(e,d){d.fx=e.x;d.fy=e.y;}
function dragend(e,d){if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}

const wsUrl='ws://'+location.host;
const statusEl=document.getElementById('status');
function connect(){
  const ws=new WebSocket(wsUrl);
  ws.onopen=()=>statusEl.textContent='● live';
  ws.onclose=()=>{statusEl.textContent='○ reconnecting...';setTimeout(connect,2000);};
  ws.onerror=()=>statusEl.textContent='✕ error';
  ws.onmessage=e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='graph_update')render(msg.payload);
    if(msg.type==='ping')ws.send(JSON.stringify({type:'pong'}));
  };
}
connect();
// Load initial state on mount
fetch('/state').then(r=>r.json()).then(s=>{if(s.nodes.length)render({...s,merge:false});});
</script></body></html>`;
  }
}
