#!/usr/bin/env node
/**
 * keg-grokker MCP Server
 * 
 * Exposes graph database operations as MCP tools that Claude Code can call.
 * Supports Kuzu, FalkorDB, and Neo4j via a unified adapter interface.
 * Also manages the real-time visualization WebSocket server lifecycle.
 * 
 * Compatible with any MCP-capable agent: Claude Code, OpenAI Codex (via MCP bridge),
 * Gemini CLI (via MCP bridge), LangChain MCP toolkit, Open-SWE, etc.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { VizServer } from './viz-server.js';
import { KuzuAdapter } from './adapters/kuzu.js';
import { Neo4jAdapter } from './adapters/neo4j.js';
import { FalkorDBAdapter } from './adapters/falkordb.js';
import type { GraphAdapter, GraphPayload } from './adapters/base.js';

// ═══════════════════════════════════════════════════
// CONNECTION REGISTRY
// Holds live database connections across tool calls.
// Each connection persists for the lifetime of the server process.
// ═══════════════════════════════════════════════════

const connections = new Map<string, GraphAdapter>();
let defaultDb = process.env.KEG_DEFAULT_DB ?? 'kuzu';
let vizServer: VizServer | null = null;
const VIZ_PORT = parseInt(process.env.KEG_VIZ_PORT ?? '7474', 10);
const PLUGIN_ROOT = process.env.KEG_PLUGIN_ROOT ?? process.cwd();

/** Get or create the default connection based on env config */
async function getOrCreateDefaultConnection(): Promise<GraphAdapter> {
  if (connections.has(defaultDb)) {
    return connections.get(defaultDb)!;
  }

  let adapter: GraphAdapter;
  
  switch (defaultDb) {
    case 'kuzu':
      adapter = new KuzuAdapter(process.env.KEG_KUZU_PATH ?? './keg_data');
      break;
    case 'neo4j':
      adapter = new Neo4jAdapter(
        process.env.KEG_NEO4J_URI ?? 'bolt://localhost:7687',
        process.env.KEG_NEO4J_USER ?? 'neo4j',
        process.env.KEG_NEO4J_PASSWORD ?? ''
      );
      break;
    case 'falkordb':
      adapter = new FalkorDBAdapter(
        process.env.KEG_FALKORDB_HOST ?? 'localhost',
        parseInt(process.env.KEG_FALKORDB_PORT ?? '6379', 10)
      );
      break;
    default:
      throw new Error(`Unknown DB type: ${defaultDb}. Use kuzu | neo4j | falkordb`);
  }

  await adapter.connect();
  connections.set(defaultDb, adapter);
  return adapter;
}

/** Resolve a specific db connection by alias, or fall back to default */
async function resolveConnection(db?: string): Promise<GraphAdapter> {
  const key = db ?? defaultDb;
  if (connections.has(key)) return connections.get(key)!;
  if (!db) return getOrCreateDefaultConnection();
  throw new Error(`No active connection for '${key}'. Use keg_connect first.`);
}

// ═══════════════════════════════════════════════════
// MCP TOOL DEFINITIONS
// Each tool is declared with its full JSON Schema so
// any MCP-compatible agent can understand it.
// ═══════════════════════════════════════════════════

const TOOLS: Tool[] = [
  {
    name: 'keg_connect',
    description: 'Connect to a graph database. Supports kuzu, neo4j, falkordb. Returns connection status and a brief schema summary.',
    inputSchema: {
      type: 'object',
      properties: {
        db_type: { type: 'string', enum: ['kuzu', 'neo4j', 'falkordb'], description: 'Which graph database to connect to' },
        connection_string: { type: 'string', description: 'Connection string: path (kuzu), bolt URI (neo4j), or redis URI (falkordb)' },
        alias: { type: 'string', description: 'Optional alias for this connection (default: db_type)' },
        username: { type: 'string', description: 'Username (neo4j only)' },
        password: { type: 'string', description: 'Password (neo4j only)' },
        set_default: { type: 'boolean', description: 'Make this the default connection', default: true },
      },
      required: ['db_type'],
    },
  },
  {
    name: 'keg_query',
    description: 'Execute a Cypher (or Cypher-compatible) query against a connected graph database. Returns rows, columns, and execution stats.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The Cypher query to execute' },
        db: { type: 'string', description: 'Which connection to use (alias or type). Defaults to active default.' },
        parameters: { type: 'object', description: 'Query parameters for parameterized queries', additionalProperties: true },
        limit: { type: 'number', description: 'Max rows to return. Injected if not in query. Default 10000.', default: 10000 },
        timeout_ms: { type: 'number', description: 'Query timeout in milliseconds', default: 30000 },
      },
      required: ['query'],
    },
  },
  {
    name: 'keg_explore',
    description: 'Expand the neighborhood of a node N hops in all or specific directions. Returns a graph payload {nodes, edges, stats} ready to visualize.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Node ID, label:id (e.g. Person:42), or a MATCH pattern' },
        hops: { type: 'number', description: 'Number of hops to expand (1-5)', default: 2, minimum: 1, maximum: 5 },
        db: { type: 'string', description: 'Which connection alias to use' },
        edge_types: { type: 'array', items: { type: 'string' }, description: 'Filter to specific relationship types only' },
        filters: { type: 'object', additionalProperties: true, description: 'Property filters on destination nodes' },
        direction: { type: 'string', enum: ['out', 'in', 'both'], default: 'both' },
        limit: { type: 'number', default: 5000 },
        include_metrics: { type: 'boolean', default: false, description: 'Compute degree centrality for returned nodes' },
      },
      required: ['target'],
    },
  },
  {
    name: 'keg_schema',
    description: 'Retrieve the full schema of the connected graph: node types with properties, relationship types, indexes, and constraints.',
    inputSchema: {
      type: 'object',
      properties: {
        db: { type: 'string', description: 'Which connection alias to use' },
        sample_data: { type: 'boolean', default: true, description: 'Include a few example values for each property' },
        include_counts: { type: 'boolean', default: true, description: 'Include node/edge counts per type' },
      },
    },
  },
  {
    name: 'keg_explain',
    description: 'Get the query execution plan for a Cypher query without executing it. Shows join order, index usage, and cost estimates.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The Cypher query to explain' },
        db: { type: 'string', description: 'Which connection alias to use' },
      },
      required: ['query'],
    },
  },
  {
    name: 'keg_metrics',
    description: 'Compute global graph metrics: node count, edge count, density, degree distribution, connected components, diameter estimate.',
    inputSchema: {
      type: 'object',
      properties: {
        db: { type: 'string', description: 'Which connection alias to use' },
        deep: { type: 'boolean', default: false, description: 'If true, compute expensive metrics (diameter, betweenness sample). May take minutes on large graphs.' },
      },
    },
  },
  {
    name: 'keg_community_detect',
    description: 'Run lightweight community detection using label propagation approximation via Cypher. Returns community assignments for all nodes.',
    inputSchema: {
      type: 'object',
      properties: {
        db: { type: 'string', description: 'Which connection alias to use' },
        node_label: { type: 'string', description: 'Restrict to a specific node type (optional)' },
        rel_type: { type: 'string', description: 'Restrict to a specific relationship type (optional)' },
        max_iterations: { type: 'number', default: 10 },
      },
    },
  },
  {
    name: 'keg_viz_start',
    description: 'Start the real-time graph visualization WebSocket server. Opens a D3.js force-directed graph in the browser. Returns the server URL.',
    inputSchema: {
      type: 'object',
      properties: {
        port: { type: 'number', description: 'Port for the viz server', default: 7474 },
        auto_open: { type: 'boolean', description: 'Open browser automatically', default: true },
      },
    },
  },
  {
    name: 'keg_viz_stop',
    description: 'Stop the visualization server and save a snapshot of the current graph state.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'keg_viz_status',
    description: 'Check the status of the visualization server: running, connected clients, current graph size.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'keg_visualize_push',
    description: 'Push graph data to the running visualization server for real-time display. Merges with or replaces existing data.',
    inputSchema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: 'Array of node objects',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              properties: { type: 'object' },
              color: { type: 'string', description: 'Override color (hex or named)' },
              size: { type: 'number', description: 'Override node radius' },
              tooltip: { type: 'string', description: 'HTML tooltip content' },
              group: { type: 'string', description: 'Community/group assignment for coloring' },
            },
            required: ['id'],
          },
        },
        edges: {
          type: 'array',
          description: 'Array of edge objects',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              source: { type: 'string' },
              target: { type: 'string' },
              type: { type: 'string', description: 'Relationship type label' },
              properties: { type: 'object' },
              color: { type: 'string' },
              width: { type: 'number', description: 'Override edge stroke width' },
            },
            required: ['source', 'target'],
          },
        },
        layout: { type: 'string', enum: ['force', 'hierarchy', 'radial', 'circle'], default: 'force' },
        merge: { type: 'boolean', default: true, description: 'If false, replace entire graph; if true, add to existing' },
        title: { type: 'string', description: 'Optional title displayed in the viz UI' },
        highlight_ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to highlight with a glow effect' },
        center_on: { type: 'string', description: 'Node ID to center the view on' },
      },
      required: ['nodes', 'edges'],
    },
  },
  {
    name: 'keg_shell_exec',
    description: 'Execute a low-level shell command against the graph environment: connect, run script, export, import. Power-user tool with direct database access.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['connect', 'run_script', 'export', 'import', 'raw_bash'],
          description: 'Shell action to perform',
        },
        db: { type: 'string', description: 'Target database alias' },
        db_type: { type: 'string', enum: ['kuzu', 'neo4j', 'falkordb'] },
        connection_string: { type: 'string' },
        script_path: { type: 'string', description: 'Path to .cypher script file (run_script)' },
        query: { type: 'string', description: 'Query for export action' },
        output_path: { type: 'string', description: 'Output file path for export' },
        output_format: { type: 'string', enum: ['csv', 'json', 'parquet'], default: 'csv' },
        input_path: { type: 'string', description: 'Input file for import' },
        bash_command: { type: 'string', description: 'Raw bash command (raw_bash action)' },
      },
      required: ['action'],
    },
  },
];

// ═══════════════════════════════════════════════════
// TOOL HANDLER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════

async function handleKgConnect(args: Record<string, unknown>) {
  const { db_type, connection_string, alias, username, password, set_default = true } = args as {
    db_type: 'kuzu' | 'neo4j' | 'falkordb';
    connection_string?: string;
    alias?: string;
    username?: string;
    password?: string;
    set_default?: boolean;
  };

  const key = (alias as string) ?? db_type;
  let adapter: GraphAdapter;

  switch (db_type) {
    case 'kuzu':
      adapter = new KuzuAdapter(connection_string ?? process.env.KEG_KUZU_PATH ?? './keg_data');
      break;
    case 'neo4j':
      adapter = new Neo4jAdapter(
        connection_string ?? process.env.KEG_NEO4J_URI ?? 'bolt://localhost:7687',
        (username as string) ?? process.env.KEG_NEO4J_USER ?? 'neo4j',
        (password as string) ?? process.env.KEG_NEO4J_PASSWORD ?? ''
      );
      break;
    case 'falkordb':
      const parts = (connection_string ?? '').replace('redis://', '').split(':');
      adapter = new FalkorDBAdapter(
        parts[0] ?? process.env.KEG_FALKORDB_HOST ?? 'localhost',
        parseInt(parts[1] ?? process.env.KEG_FALKORDB_PORT ?? '6379', 10)
      );
      break;
  }

  await adapter.connect();
  connections.set(key, adapter);
  if (set_default) defaultDb = key;

  const schema = await adapter.getSchema({ sampleData: false, includeCounts: true });
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'connected',
        alias: key,
        db_type,
        is_default: set_default,
        schema_summary: {
          node_types: schema.nodeTypes.length,
          relationship_types: schema.relTypes.length,
          node_labels: schema.nodeTypes.map(n => n.name),
        },
      }, null, 2),
    }],
  };
}

async function handleKgQuery(args: Record<string, unknown>) {
  const { query, db, parameters = {}, limit = 10000, timeout_ms = 30000 } = args as {
    query: string; db?: string; parameters?: Record<string, unknown>;
    limit?: number; timeout_ms?: number;
  };

  const adapter = await resolveConnection(db);
  
  // Auto-inject LIMIT if not present and query is a MATCH (not CREATE/MERGE/DELETE)
  let finalQuery = query;
  const isReadQuery = /^\s*MATCH/i.test(query);
  if (isReadQuery && !/\bLIMIT\b/i.test(query)) {
    finalQuery = `${query.trim()}\nLIMIT ${limit}`;
  }

  const start = Date.now();
  const result = await adapter.query(finalQuery, parameters as Record<string, unknown>);
  const elapsed = Date.now() - start;

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        columns: result.columns,
        rows: result.rows,
        row_count: result.rows.length,
        execution_time_ms: elapsed,
        query_used: finalQuery,
      }, null, 2),
    }],
  };
}

async function handleKgExplore(args: Record<string, unknown>) {
  const {
    target, hops = 2, db, edge_types, filters = {},
    direction = 'both', limit = 5000, include_metrics = false,
  } = args as {
    target: string; hops?: number; db?: string;
    edge_types?: string[]; filters?: Record<string, unknown>;
    direction?: 'out' | 'in' | 'both'; limit?: number; include_metrics?: boolean;
  };

  const adapter = await resolveConnection(db);
  const payload = await adapter.explore(target, { hops, edgeTypes: edge_types, filters, direction, limit });

  // Optionally compute degree centrality within the result subgraph
  if (include_metrics && payload.nodes.length > 0) {
    const degreeMap = new Map<string, number>();
    for (const edge of payload.edges) {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1);
    }
    for (const node of payload.nodes) {
      (node.properties as Record<string, unknown>)['_degree'] = degreeMap.get(node.id) ?? 0;
    }
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        ...payload,
        stats: {
          node_count: payload.nodes.length,
          edge_count: payload.edges.length,
          hops_explored: hops,
          target,
        },
      }, null, 2),
    }],
  };
}

async function handleKgSchema(args: Record<string, unknown>) {
  const { db, sample_data = true, include_counts = true } = args as {
    db?: string; sample_data?: boolean; include_counts?: boolean;
  };
  const adapter = await resolveConnection(db);
  const schema = await adapter.getSchema({ sampleData: sample_data, includeCounts: include_counts });
  return { content: [{ type: 'text', text: JSON.stringify(schema, null, 2) }] };
}

async function handleKgMetrics(args: Record<string, unknown>) {
  const { db, deep = false } = args as { db?: string; deep?: boolean };
  const adapter = await resolveConnection(db);

  // Node and edge counts by type
  const nodeCountQuery = `MATCH (n) RETURN labels(n)[0] AS label, COUNT(*) AS count`;
  const edgeCountQuery = `MATCH ()-[r]->() RETURN type(r) AS type, COUNT(*) AS count`;
  const degreeQuery = `
    MATCH (n)-[r]-()
    WITH n, COUNT(r) AS degree
    RETURN AVG(degree) AS avg_degree, MAX(degree) AS max_degree, MIN(degree) AS min_degree,
           COUNT(*) AS total_nodes
  `;

  const [nodeCounts, edgeCounts, degreeStats] = await Promise.all([
    adapter.query(nodeCountQuery, {}),
    adapter.query(edgeCountQuery, {}),
    adapter.query(degreeQuery, {}),
  ]);

  const totalNodes = nodeCounts.rows.reduce((sum: number, r: Record<string, unknown>) => sum + (r.count as number), 0);
  const totalEdges = edgeCounts.rows.reduce((sum: number, r: Record<string, unknown>) => sum + (r.count as number), 0);
  const density = totalNodes > 1 ? totalEdges / (totalNodes * (totalNodes - 1)) : 0;

  const metrics: Record<string, unknown> = {
    total_nodes: totalNodes,
    total_edges: totalEdges,
    density: density.toFixed(6),
    degree_stats: degreeStats.rows[0] ?? {},
    nodes_by_type: Object.fromEntries(nodeCounts.rows.map((r: Record<string, unknown>) => [r.label, r.count])),
    edges_by_type: Object.fromEntries(edgeCounts.rows.map((r: Record<string, unknown>) => [r.type, r.count])),
  };

  if (deep) {
    // Triangle count (expensive but Kuzu handles it well with WCO joins)
    try {
      const triResult = await adapter.query(
        `MATCH (a)-[:KNOWS]->(b)-[:KNOWS]->(c)-[:KNOWS]->(a) RETURN COUNT(*) AS triangles`,
        {}
      );
      metrics.triangle_count = triResult.rows[0]?.triangles ?? 'N/A';
    } catch (_) {
      metrics.triangle_count = 'requires KNOWS relationship';
    }
  }

  return { content: [{ type: 'text', text: JSON.stringify(metrics, null, 2) }] };
}

async function handleKgVizStart(args: Record<string, unknown>) {
  const { port = VIZ_PORT, auto_open = true } = args as { port?: number; auto_open?: boolean };
  
  if (vizServer?.isRunning()) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ status: 'already_running', url: `http://localhost:${vizServer.port}` }),
      }],
    };
  }

  vizServer = new VizServer({ port, pluginRoot: PLUGIN_ROOT, autoOpen: auto_open });
  await vizServer.start();

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'started',
        url: `http://localhost:${port}`,
        message: auto_open ? 'Browser opened automatically' : `Visit http://localhost:${port} to see the graph`,
      }),
    }],
  };
}

async function handleKgVizStop(_args: Record<string, unknown>) {
  if (!vizServer?.isRunning()) {
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'not_running' }) }] };
  }
  const snapshot = await vizServer.snapshot();
  await vizServer.stop();
  vizServer = null;
  return { content: [{ type: 'text', text: JSON.stringify({ status: 'stopped', snapshot_data: snapshot }) }] };
}

async function handleKgVizStatus(_args: Record<string, unknown>) {
  if (!vizServer?.isRunning()) {
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'not_running' }) }] };
  }
  return { content: [{ type: 'text', text: JSON.stringify(vizServer.status()) }] };
}

async function handleKgVisualizePush(args: Record<string, unknown>) {
  const { nodes = [], edges = [], layout = 'force', merge = true, title, highlight_ids, center_on } = args as {
    nodes: GraphPayload['nodes']; edges: GraphPayload['edges'];
    layout?: string; merge?: boolean; title?: string;
    highlight_ids?: string[]; center_on?: string;
  };

  if (!vizServer?.isRunning()) {
    // Auto-start if not running
    vizServer = new VizServer({ port: VIZ_PORT, pluginRoot: PLUGIN_ROOT, autoOpen: true });
    await vizServer.start();
  }

  vizServer.push({ nodes, edges }, { layout, merge, title, highlightIds: highlight_ids, centerOn: center_on });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        pushed: { nodes: nodes.length, edges: edges.length },
        layout,
        merge,
        url: `http://localhost:${vizServer.port}`,
      }),
    }],
  };
}

async function handleKgCommunityDetect(args: Record<string, unknown>) {
  const { db, node_label, rel_type, max_iterations = 10 } = args as {
    db?: string; node_label?: string; rel_type?: string; max_iterations?: number;
  };
  const adapter = await resolveConnection(db);

  // Simplified label propagation via triangle-counting proxy
  // Real community detection would call GDS or a Python library
  const nodePattern = node_label ? `(n:${node_label})` : '(n)';
  const relPattern = rel_type ? `[:${rel_type}]` : '[]';

  const triangleQuery = `
    MATCH ${nodePattern}-${relPattern}->()-${relPattern}->()-${relPattern}->(n)
    RETURN n, COUNT(*) AS triangle_count
    ORDER BY triangle_count DESC
    LIMIT 1000
  `;

  const result = await adapter.query(triangleQuery, {});
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        method: 'triangle_count_proxy',
        note: 'For full Louvain/label propagation, use the Python semantic layer (keg-shell .py mode)',
        communities: result.rows,
        max_iterations,
      }, null, 2),
    }],
  };
}

async function handleKgExplain(args: Record<string, unknown>) {
  const { query, db } = args as { query: string; db?: string };
  const adapter = await resolveConnection(db);
  
  try {
    const plan = await adapter.explain(query);
    return { content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }] };
  } catch (e) {
    return { content: [{ type: 'text', text: `EXPLAIN not supported by this adapter: ${(e as Error).message}` }] };
  }
}

async function handleKgShellExec(args: Record<string, unknown>) {
  const { action, bash_command, script_path, query, output_path, output_format = 'csv' } = args as {
    action: string; bash_command?: string; script_path?: string;
    query?: string; output_path?: string; output_format?: string;
  };

  const { execSync } = await import('child_process');
  const fs = await import('fs');

  switch (action) {
    case 'connect':
      return handleKgConnect(args);

    case 'run_script': {
      if (!script_path) throw new Error('script_path required for run_script');
      const content = fs.readFileSync(script_path, 'utf-8');
      const statements = content
        .split(/;[\s]*\n/)
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));
      
      const adapter = await resolveConnection(args.db as string | undefined);
      const results = [];
      for (const stmt of statements) {
        try {
          const r = await adapter.query(stmt, {});
          results.push({ statement: stmt.slice(0, 80) + '...', rows: r.rows.length, status: 'ok' });
        } catch (e) {
          results.push({ statement: stmt.slice(0, 80) + '...', error: (e as Error).message, status: 'error' });
        }
      }
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }

    case 'export': {
      if (!query || !output_path) throw new Error('query and output_path required for export');
      const adapter = await resolveConnection(args.db as string | undefined);
      const result = await adapter.query(query, {});
      
      const dir = output_path.substring(0, output_path.lastIndexOf('/'));
      if (dir) fs.mkdirSync(dir, { recursive: true });

      if (output_format === 'json') {
        fs.writeFileSync(output_path, JSON.stringify(result.rows, null, 2));
      } else if (output_format === 'csv') {
        const cols = result.columns;
        const lines = [cols.join(','), ...result.rows.map((r: Record<string, unknown>) => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))];
        fs.writeFileSync(output_path, lines.join('\n'));
      }
      return { content: [{ type: 'text', text: JSON.stringify({ exported: result.rows.length, path: output_path, format: output_format }) }] };
    }

    case 'raw_bash': {
      if (!bash_command) throw new Error('bash_command required for raw_bash');
      try {
        const output = execSync(bash_command, { encoding: 'utf-8', timeout: 30000, cwd: process.cwd() });
        return { content: [{ type: 'text', text: output }] };
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; message?: string };
        return { content: [{ type: 'text', text: `ERROR: ${err.message}\nSTDOUT: ${err.stdout}\nSTDERR: ${err.stderr}` }] };
      }
    }

    default:
      throw new Error(`Unknown shell action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════
// SERVER SETUP AND MAIN LOOP
// ═══════════════════════════════════════════════════

const server = new Server(
  { name: 'keg-grokker', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  
  try {
    switch (name) {
      case 'keg_connect':         return await handleKgConnect(args);
      case 'keg_query':           return await handleKgQuery(args);
      case 'keg_explore':         return await handleKgExplore(args);
      case 'keg_schema':          return await handleKgSchema(args);
      case 'keg_explain':         return await handleKgExplain(args);
      case 'keg_metrics':         return await handleKgMetrics(args);
      case 'keg_community_detect':return await handleKgCommunityDetect(args);
      case 'keg_viz_start':       return await handleKgVizStart(args);
      case 'keg_viz_stop':        return await handleKgVizStop(args);
      case 'keg_viz_status':      return await handleKgVizStatus(args);
      case 'keg_visualize_push':  return await handleKgVisualizePush(args);
      case 'keg_shell_exec':      return await handleKgShellExec(args);
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Tool error (${name}): ${msg}` }], isError: true };
  }
});

// Graceful shutdown: close all DB connections
process.on('SIGTERM', async () => {
  for (const [, adapter] of connections) {
    try { await adapter.disconnect(); } catch (_) {}
  }
  if (vizServer?.isRunning()) await vizServer.stop();
  process.exit(0);
});

const transport = new StdioServerTransport();
server.connect(transport);
console.error('[keg-grokker] MCP server started on stdio');
