---
name: keg-grok
description: >
  Deep AI-powered knowledge graph analysis. Goes far beyond simple queries — performs
  multi-pass graph intelligence: schema inference, community detection, anomaly hunting,
  semantic pattern extraction, and natural-language explanation of what the graph means.
  Use when the user wants to UNDERSTAND a graph, not just query it. The "think hard" mode.
  Orchestrates multiple subagents in parallel for comprehensive analysis.
allowed-tools:
  - Bash
  - mcp__keg-grokker__keg_query
  - mcp__keg-grokker__keg_explore
  - mcp__keg-grokker__keg_schema
  - mcp__keg-grokker__keg_metrics
  - mcp__keg-grokker__keg_visualize_push
  - mcp__keg-grokker__keg_viz_start
  - mcp__keg-grokker__keg_community_detect
user-invocable: true
---

# /keg-grok — Deep Knowledge Graph Intelligence

You are performing comprehensive, multi-dimensional intelligence analysis of a knowledge graph.
This is NOT a simple query. This is a full investigative dive.
Arguments: $ARGUMENTS
(Format: `[--db kuzu|neo4j|falkordb] [--focus <topic_or_node>] [--depth shallow|deep|paranoid] [--report]`)

Parse arguments:
- `db`: target backend (default: $KEG_DEFAULT_DB)
- `focus`: optional focal point — a node, label type, or domain concept to center analysis on
- `depth`: how deep to go — `shallow` (fast overview), `deep` (full analysis, default), `paranoid` (everything, may take minutes)
- `report`: whether to produce a full markdown report at the end

## PARALLEL INTELLIGENCE COLLECTION

Spawn all of the following analysis passes IN PARALLEL (use concurrent tool calls where possible):

### Pass A — Schema & Ontology Analysis
Call `mcp__keg-grokker__keg_schema` to get the full schema. Analyze:
- How many distinct node labels and relationship types?
- What are the property distributions for each label?
- Are there any schema inconsistencies (nodes with the same label but wildly different properties)?
- What relationships are used most vs. least?
- Are there any orphaned node types (no incoming or outgoing relationships)?

### Pass B — Graph-Level Metrics
Call `mcp__keg-grokker__keg_metrics` for global statistics:
- Node count, edge count, density
- Average degree, max degree, degree distribution (is it power-law? Random? Regular?)
- Number of connected components and sizes
- Average clustering coefficient
- Diameter (longest shortest path) — estimate if graph is large
- Any singletons (nodes with degree 0)?

### Pass C — Hub & Authority Detection
Query for highest-degree nodes:
```cypher
MATCH (n)-[r]-()
RETURN labels(n)[0] AS type, n, COUNT(r) AS degree
ORDER BY degree DESC LIMIT 20
```
These are your hubs. High-degree nodes are either critical infrastructure or potential anomalies.
Also check for nodes with high IN-degree specifically (authorities) vs high OUT-degree (broadcasters).

### Pass D — Community Structure
Call `mcp__keg-grokker__keg_community_detect`. This runs a lightweight community detection
(label propagation or Louvain approximation via Cypher triangle counting) to identify clusters.
How many communities? How balanced are they? Are there bridge nodes between communities?

### Pass E — Anomaly Hunting
Look for structural anomalies:
- Nodes that appear in many relationships but have almost no properties (data quality issue)
- Relationship types that appear only once or twice (orphan relationship types)
- Dangling references (relationships pointing to non-existent nodes)
- Cycles of length 2 (A→B→A) — sometimes meaningful, sometimes data errors
- Self-loops (A→A)
- Any nodes with contradictory property values (e.g. age < 0, timestamps in the future)

### Pass F — Temporal Analysis (if timestamps exist)
If the schema reveals date/timestamp properties, analyze temporal patterns:
- When were nodes/edges created? Is there a burst pattern?
- Are there relationships that span unusually long time periods?
- Is the graph growing, shrinking, or stable?

## SYNTHESIS

After all passes complete, synthesize findings into a coherent narrative:

1. **The Big Picture**: What is this graph fundamentally representing? What story does it tell?
2. **Power Structure**: Who/what are the most important nodes and why?
3. **Interesting Patterns**: What non-obvious patterns emerged from community and anomaly analysis?
4. **Data Quality**: What are the biggest data quality issues? How severe?
5. **Blank Spots**: What seems to be missing from this graph that you'd expect to be there?
6. **Danger Zones**: Any structural patterns that are concerning (e.g. single points of failure, isolated clusters that should be connected)?

## VISUALIZATION

Push the most revealing subgraph to the viz server:
- Show the top communities with different colors
- Size nodes by degree centrality
- Highlight anomalous nodes in red
- Show bridge nodes between communities in a contrasting color

Call `mcp__keg-grokker__keg_viz_start` then `mcp__keg-grokker__keg_visualize_push` with enhanced
node metadata (color, size, tooltip fields from analysis).

## OUTPUT FORMAT

If --report: produce a full, structured markdown report with sections for each analysis pass,
a findings summary, and actionable recommendations.

Otherwise: produce a dense, insightful narrative briefing (like an analyst presenting to an exec)
— no bullet-point soup, just clear intelligent prose with supporting data inline.

End with: "Top 3 follow-up explorations I recommend..." with ready-to-run commands.
