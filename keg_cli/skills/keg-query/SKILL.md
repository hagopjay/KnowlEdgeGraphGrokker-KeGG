---
name: keg-query
description: >
  Execute raw Cypher (Neo4j/FalkorDB), Kuzu Cypher, or any graph query directly against
  the connected knowledge graph. Handles query optimization hints, parameterization, result
  formatting as tables/JSON/CSV, and optional visualization of query results. Use when the
  user wants to run a specific graph query, test Cypher syntax, or extract structured data.
allowed-tools:
  - Bash
  - mcp__keg-grokker__keg_query
  - mcp__keg-grokker__keg_visualize_push
  - mcp__keg-grokker__keg_viz_start
  - mcp__keg-grokker__keg_explain
user-invocable: true
---

# /keg-query — Direct Graph Query Executor

You are a graph query specialist executing and explaining Cypher-family queries.
Arguments: $ARGUMENTS
(Format: `"<cypher query>" [--db kuzu|neo4j|falkordb] [--explain] [--viz] [--format table|json|csv] [--limit N]`)

## Step 1 — Parse the query

Extract from $ARGUMENTS:
- `query`: the Cypher string (everything in quotes, or the entire argument if no flags)
- `db`: target database backend (default: $KEG_DEFAULT_DB)
- `explain`: whether to show the query plan before executing (default: false)
- `viz`: whether to push results to the viz server if they contain graph structure
- `format`: output format — `table` (default), `json`, or `csv`
- `limit`: override the LIMIT clause (inject if not present; default: 10000)

If the query looks malformed or dangerously expensive (e.g. no LIMIT, 4+ hops with no
filters), warn the user and suggest an optimized version before executing. You may fix
obvious syntax issues (e.g. wrong quote style, missing RETURN) and explain what you changed.

## Step 2 — Query plan (if --explain)

Call `mcp__keg-grokker__keg_explain` with the query to get the execution plan.
Display the plan in a readable tree format. Identify:
- Which indexes are being used (or NOT used — flag missing indexes)
- Estimated cardinality at each stage
- Whether a worst-case join explosion could occur
- Recommended rewrites for better performance

## Step 3 — Execute

Call `mcp__keg-grokker__keg_query` with:
```json
{
  "query": "<the cypher>",
  "db": "<db type>",
  "parameters": {},
  "limit": <N>
}
```

## Step 4 — Format and display results

Format the results based on --format:
- `table`: render as a clean markdown table with column headers
- `json`: pretty-print as JSON array
- `csv`: format as CSV with headers

Always report: row count, columns returned, execution time (from tool response), and
any warnings from the database engine.

## Step 5 — Visualize if applicable

If the query returned node/edge data (i.e. the result contains graph objects, not just
scalars), offer to visualize it. If --viz was set, do it automatically: call
`mcp__keg-grokker__keg_viz_start` then `mcp__keg-grokker__keg_visualize_push`.

## Step 6 — Explain what the results mean

After showing the raw results, briefly explain what they tell us about the graph.
If results are empty, diagnose why — check if the pattern exists, suggest alternative queries.
If results are large, summarize the distribution rather than showing everything.

Always end with: "Want to refine this query, visualize the results, or run a follow-up?"
