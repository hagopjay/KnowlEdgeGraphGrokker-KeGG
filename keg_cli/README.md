# ⬡ keg-grokker

**Knowledge graph exploration, querying, and real-time visualization for Claude Code.**
Supports Kuzu, FalkorDB, Neo4j — and any openCypher-compatible graph database.

```
/plugin install your-org/keg-grokker
```

---

## What it does

keg-grokker is a Claude Code plugin that turns any graph database into an interactive
intelligence platform. It ships five powerful skills, three specialized subagents,
a real-time WebSocket visualization server, and a Python semantic layer — all wired
together through a typed MCP server.

```
/keg-explore Person:42 --hops 3 --viz          # Explore + auto-launch browser viz
/keg-query "MATCH (a)-[r:TRANSACTS]->(b) WHERE r.amount > 10000 RETURN a,r,b LIMIT 100"
/keg-grok --depth deep --report                # Full AI intelligence analysis
/keg-visualize start                           # Launch real-time D3.js graph server
/keg-shell .connect kuzu ./my_graph            # Advanced interactive shell
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Claude Code                                                     │
│  ├── /keg-explore  (SKILL.md)  → neighborhood expansion + viz   │
│  ├── /keg-query    (SKILL.md)  → raw Cypher execution           │
│  ├── /keg-grok     (SKILL.md)  → deep AI pattern analysis       │
│  ├── /keg-visualize(SKILL.md)  → viz server control             │
│  └── /keg-shell    (SKILL.md)  → power shell (bash + graph)     │
│                                                                  │
│  Agents:                                                         │
│  ├── graph-detective  → anomaly & fraud pattern hunting         │
│  ├── schema-oracle    → schema inference & documentation        │
│  └── path-hunter      → shortest path & reachability           │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ MCP (stdio)
┌──────────────────────────────────▼──────────────────────────────┐
│  MCP Server (Node.js/TypeScript)                                 │
│  ├── keg_connect / keg_query / keg_explore / keg_schema             │
│  ├── keg_metrics / keg_explain / keg_community_detect              │
│  ├── keg_viz_start / keg_viz_stop / keg_visualize_push             │
│  └── keg_shell_exec                                              │
│                                                                  │
│  Adapters:                                                       │
│  ├── KuzuAdapter    (embedded, no server needed)                │
│  ├── Neo4jAdapter   (Bolt protocol, cloud-ready)                │
│  └── FalkorDBAdapter(Redis protocol)                            │
│                                                                  │
│  Viz Server (Express + WebSocket):                               │
│  └── http://localhost:7474  ←  D3.js force graph UI            │
└──────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────┐
│  Python Semantic Layer (semantic/semantic_layer.py)              │
│  ├── GraphOntology   (schema + domain knowledge registry)       │
│  ├── CypherBuilder   (high-level → Cypher translation)          │
│  ├── QueryCache      (LRU + TTL caching)                        │
│  ├── ResultEnricher  (degree centrality, PII masking, metrics)  │
│  └── SemanticGraphService (unified Python API)                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- Claude Code (latest)
- Node.js ≥ 18
- At least one of:
  - **Kuzu**: just `npm install kuzu` (embedded, no server)
  - **Neo4j**: running instance (local or AuraDB)
  - **FalkorDB**: `docker run -p 6379:6379 falkordb/falkordb`

### Install from marketplace

```bash
/plugin install your-org/keg-grokker
```

### Install locally (development)

```bash
git clone https://github.com/your-org/keg-grokker
cd keg-grokker/server
npm install
npm run build
cd ..
claude --plugin-dir ./keg-grokker
```

### Build server

```bash
cd server
npm install
npm run build
```

### Configure

The plugin reads configuration from environment variables (set in your shell or `.env`):

| Variable | Default | Description |
|---|---|---|
| `KEG_DEFAULT_DB` | `kuzu` | Active database: `kuzu`, `neo4j`, `falkordb` |
| `KEG_KUZU_PATH` | `./keg_data` | Path to Kuzu database directory |
| `KEG_NEO4J_URI` | `bolt://localhost:7687` | Neo4j bolt URI |
| `KEG_NEO4J_USER` | `neo4j` | Neo4j username |
| `KEG_NEO4J_PASSWORD` | _(empty)_ | Neo4j password |
| `KEG_FALKORDB_HOST` | `localhost` | FalkorDB host |
| `KEG_FALKORDB_PORT` | `6379` | FalkorDB port |
| `KEG_VIZ_PORT` | `7474` | Visualization server port |
| `KEG_VIZ_AUTO_OPEN` | `true` | Auto-open browser |

---

## Skills Reference

### `/keg-explore <target> [options]`

Expand a node's neighborhood N hops, apply filters, and launch visualization.

```
/keg-explore Person:42
/keg-explore Person:42 --hops 3 --viz
/keg-explore "Person:name:Alice" --hops 2 --filter risk=0.8
/keg-explore Account:acc_001 --edge-types TRANSACTS --hops 4 --direction out
/keg-explore 42 --db neo4j --metrics
```

**Target formats:**
- `42` — node by internal ID
- `Person:42` — node by label + primary key value
- `Person:name:Alice` — node by label + property + value
- `"MATCH (p:Person {email: 'a@b.com'})"` — raw Cypher anchor

### `/keg-query "<cypher>" [options]`

Execute raw Cypher with smart defaults, auto-LIMIT injection, and optional visualization.

```
/keg-query "MATCH (p:Person) RETURN p LIMIT 20"
/keg-query "MATCH (a:Account)-[t:TRANSACTS]->(b) WHERE t.amount > 9000 RETURN a,t,b" --viz
/keg-query "..." --explain                   # Show query plan first
/keg-query "..." --format csv > output.csv   # Export to CSV
/keg-query "..." --db neo4j                  # Target specific DB
```

### `/keg-grok [options]`

Deep AI analysis: schema, metrics, community detection, anomalies, temporal patterns.
Orchestrates multiple analysis passes in parallel.

```
/keg-grok
/keg-grok --depth shallow                    # Fast overview
/keg-grok --depth paranoid                   # Everything, may take minutes
/keg-grok --focus Person                     # Center analysis on Person nodes
/keg-grok --report                           # Generate full markdown report
```

### `/keg-visualize <subcommand>`

Control the real-time D3.js visualization server.

```
/keg-visualize start                         # Launch at http://localhost:7474
/keg-visualize start --port 8080
/keg-visualize push --query "MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 500" --layout radial
/keg-visualize status
/keg-visualize snapshot                      # Save current state to file
/keg-visualize reset                         # Clear canvas
/keg-visualize stop
```

**Keyboard shortcuts in the viz UI:**
| Key | Action |
|---|---|
| `f` | Force layout |
| `h` | Hierarchy layout |
| `r` | Radial layout |
| `c` | Circle layout |
| `l` | Toggle labels |
| `0` | Reset zoom |
| `/` | Search nodes |
| `Esc` | Close panel / search |

### `/keg-shell <command>`

The power shell. Full bash + graph + Python access.

```
/keg-shell .connect kuzu ./production_graph
/keg-shell .connect neo4j bolt://prod:7687 --set-default
/keg-shell .schema
/keg-shell .schema Person
/keg-shell .run /path/to/migration.cypher
/keg-shell .export MATCH (n:Person) RETURN n > /tmp/people.csv
/keg-shell .py from semantic_layer import SemanticGraphService; svc = SemanticGraphService('./db'); print(svc.cache_stats)
/keg-shell .bench "MATCH (a)-[:KNOWS]->(b) RETURN a,b LIMIT 1000" --runs 20
/keg-shell .watch "MATCH (n:Account) RETURN COUNT(n)" --interval 5
/keg-shell MATCH (n:Person {id: 42})-[:KNOWS*2]->(fof) RETURN DISTINCT fof LIMIT 50
```

---

## Agents Reference

### `graph-detective`

Hunts for structural anomalies, suspicious patterns, cycles, statistical outliers.
Invoked automatically by `/keg-grok` or call directly:

```
Use the graph-detective to find anomalies in the TRANSACTS subgraph
```

### `schema-oracle`

Infers, documents, and validates graph schemas. Generates ontology docs and migration scripts.

```
Use the schema-oracle to document the current graph schema
Use the schema-oracle to help me migrate the Person label to add a clearance_level property
```

### `path-hunter`

Finds shortest paths, all paths, betweenness, flow bottlenecks.

```
Use the path-hunter to find how Person:42 and Person:777 are connected
Use the path-hunter to find bridge nodes in the social network
```

---

## Python Semantic Layer

For analytics-heavy workloads, use the semantic layer directly:

```python
from semantic.semantic_layer import SemanticGraphService, GraphOntology, NodeType, EdgeType

# Quick start — just a path
svc = SemanticGraphService('./my_kuzu_db')

# High-level exploration
df = svc.explore('Person', 42, hops=3, filters={'risk': {'gt': 0.7}})
print(df)

# Pattern matching
suspicious = svc.find_pattern([
    {'type': 'Person', 'filters': {'risk': {'gt': 0.8}}},
    {'edge': 'CONTROLS'},
    {'type': 'Account'},
    {'edge': 'TRANSACTS', 'filters': {'amount': {'gt': 9000}}},
    {'type': 'Account'},
])

# Raw Cypher
raw = svc.raw("MATCH (n:Person) RETURN n.name, n.risk ORDER BY n.risk DESC LIMIT 10")

# Cache stats
print(svc.cache_stats)  # {'size': 12, 'hits': 45, 'misses': 12, 'hit_rate': '78.9%'}
svc.close()
```

CLI mode:
```bash
python3 semantic/semantic_layer.py --db ./my_db --query "MATCH (n) RETURN n LIMIT 5"
python3 semantic/semantic_layer.py --db ./my_db --explore Person:42 --hops 3 --format json
```

---

## Cross-Agent Compatibility

The MCP server exposes a standard MCP interface over stdio. Any agent that speaks MCP
can use all `keg_*` tools — no modification needed:

| Agent | MCP Support | Notes |
|---|---|---|
| **Claude Code** | ✅ Native | Full skills + agents + MCP |
| **OpenAI Codex** | ✅ via MCP bridge | Use `keg_*` tools directly |
| **Gemini CLI** | ✅ via MCP bridge | Standard MCP protocol |
| **LangChain** | ✅ `langchain-mcp-adapters` | Mount as a tool |
| **Open-SWE** | ✅ MCP client | Works out of the box |
| **Cursor** | ✅ MCP in settings | Add to `.cursor/mcp.json` |
| **Continue.dev** | ✅ MCP plugin | Add to config |

For non-Claude agents, add the server to their MCP config:

```json
{
  "mcpServers": {
    "keg-grokker": {
      "command": "node",
      "args": ["/path/to/keg-grokker/server/dist/mcp-server.js"],
      "env": {
        "KEG_DEFAULT_DB": "kuzu",
        "KEG_KUZU_PATH": "./keg_data"
      }
    }
  }
}
```

---

## Adding More Graph Databases

Adding a new adapter (e.g. Amazon Neptune, TigerGraph, MemGraph) is purely additive:

1. Create `server/src/adapters/your-db.ts` implementing `GraphAdapter`
2. Add a case to the `switch (db_type)` in `mcp-server.ts`
3. Add the new type to the `keg_connect` tool enum schema
4. Done — all skills, agents, and the viz server work automatically

---

## Marketplace Publishing

```bash
# Initialize marketplace config
cat > .claude-plugin/marketplace.json << EOF
{
  "name": "keg-grokker",
  "description": "Knowledge graph exploration and visualization for Kuzu, FalkorDB, Neo4j",
  "tags": ["knowledge-graph", "cypher", "visualization", "kuzu", "neo4j"],
  "version": "1.0.0",
  "source": "https://github.com/your-org/keg-grokker"
}
EOF

# Users install via:
# /plugin install your-org/keg-grokker
# or from your marketplace:
# /plugin marketplace add your-org/marketplace
# /plugin install keg-grokker
```

---

## License

MIT
