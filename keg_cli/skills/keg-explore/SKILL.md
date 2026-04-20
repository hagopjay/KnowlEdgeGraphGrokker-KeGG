---
name: keg-explore
description: >
  Explore the neighborhood of a node or pattern in the connected knowledge graph.
  Automatically expands N hops, applies semantic filters, and launches the real-time
  visualization server. Use when the user wants to understand connections, find neighbors,
  trace relationships, or visually explore a subgraph. Supports Kuzu, FalkorDB, Neo4j.
allowed-tools:
  - Bash
  - mcp__keg-grokker__keg_explore
  - mcp__keg-grokker__keg_visualize_push
  - mcp__keg-grokker__keg_viz_start
  - mcp__keg-grokker__keg_schema
user-invocable: true
---

# /keg-explore — Knowledge Graph Neighborhood Explorer

You are executing a deep, multi-hop neighborhood exploration of a knowledge graph.
Arguments: $ARGUMENTS
(Format: `<node_id_or_pattern> [--hops N] [--db kuzu|neo4j|falkordb] [--filter key=val] [--viz] [--metrics]`)

## Phase 1 — Parse and orient

Parse $ARGUMENTS to extract:
- `target`: the node ID, label:id pattern, or Cypher pattern (e.g. `Person:42`, `42`, `"MATCH (p:Person {name:'Alice'})"`)
- `hops`: number of hops to expand (default: 2, max: 5 — warn if >3 on large graphs)
- `db`: which graph backend to use (default: $KEG_DEFAULT_DB)
- `filter`: optional property filters in key=value format
- `viz`: whether to launch real-time visualization (default: true)
- `metrics`: whether to compute graph metrics on result (degree, clustering, PageRank)

If the target is ambiguous, use `mcp__keg-grokker__keg_schema` to understand what node types exist,
then ask the user to clarify — but make a smart educated guess first.

## Phase 2 — Schema awareness

Call `mcp__keg-grokker__keg_schema` for the selected database. Study the node types, relationship
types, and property names. This tells you what traversals are meaningful and what filters
can be pushed down to the query engine (far faster than post-filtering in Python).

## Phase 3 — Execute the exploration

Call `mcp__keg-grokker__keg_explore` with:
```json
{
  "target": "<parsed target>",
  "hops": <N>,
  "db": "<db type>",
  "filters": { "<key>": "<value>" },
  "include_metrics": <bool>,
  "limit": 5000
}
```

The tool returns a graph payload: `{ nodes: [...], edges: [...], stats: {...} }`.

## Phase 4 — Visualize (if --viz or default)

Call `mcp__keg-grokker__keg_viz_start` to ensure the visualization server is running.
Then call `mcp__keg-grokker__keg_visualize_push` with the returned graph payload.
The server will open a browser window at http://localhost:$KEG_VIZ_PORT automatically.
Tell the user the URL so they can interact with the live force-directed graph.

## Phase 5 — Interpret and narrate

After exploration, provide a rich interpretation:
- How many nodes and edges were found at each hop distance?
- What are the most connected nodes (by degree in the subgraph)?
- Are there any surprising cluster structures or bottleneck nodes?
- What relationship types dominate the subgraph?
- If metrics were requested, highlight any nodes with unusually high centrality or clustering coefficient.

Surface the top 5 most interesting nodes with a brief explanation of why each matters.

## Phase 6 — Suggest next steps

Based on what you found, suggest 2-3 follow-up explorations the user might want to try:
- A deeper dive into a specific high-centrality node
- A pattern match that targets an interesting structure you noticed
- A path query between two distant nodes that look related

Format suggestions as ready-to-run `/keg-explore` or `/keg-query` commands.
