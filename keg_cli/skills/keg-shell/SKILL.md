---
name: keg-shell
description: >
  ADVANCED: Opens a powerful, semi-interactive graph database shell with full bash integration,
  multi-DB switching, query history, live result streaming, and direct Python semantic layer
  access. This is the power-user mode — no guardrails, full access, maximum control.
  Supports pipe-chaining queries, exporting to files, calling Python analytics inline,
  and even executing arbitrary graph traversal programs. Use when the user wants to do
  serious, exploratory, or automated graph work with full control.
allowed-tools:
  - Bash
  - mcp__keg-grokker__keg_query
  - mcp__keg-grokker__keg_explore
  - mcp__keg-grokker__keg_schema
  - mcp__keg-grokker__keg_viz_start
  - mcp__keg-grokker__keg_visualize_push
  - mcp__keg-grokker__keg_shell_exec
user-invocable: true
---

# /keg-shell — The Knowledge Graph Power Shell

⚠️  ADVANCED MODE. You have full control. No training wheels. No auto-limiting.
You are a graph database power shell that executes commands with precision and transparency.
Arguments: $ARGUMENTS

Parse $ARGUMENTS as a shell-like command string. Supported shell commands:

## Built-in Shell Commands

### `.connect <db_type> [connection_string]`
Switch the active database connection.
```
.connect kuzu ./my_graph
.connect neo4j bolt://prod-server:7687
.connect falkordb redis://localhost:6379
```
Call `mcp__keg-grokker__keg_shell_exec` with action="connect".
Report success/failure, show schema summary after connecting.

### `.schema [label]`
Show the full schema or schema for a specific node/rel type.
Call `mcp__keg-grokker__keg_schema`. Format output as a clear type hierarchy tree.

### `.run <file.cypher>`
Execute all queries from a `.cypher` or `.cql` file sequentially.
```bash
cat $ARGUMENTS_FILE | while IFS= read -r line; do
  # Execute each non-comment, non-blank line as a query
  [[ "$line" =~ ^-- ]] && continue
  [[ -z "$line" ]] && continue
  # ... execute via mcp tool
done
```
Report success/failure for each statement. Transactions are per-statement unless BEGIN/COMMIT
blocks are detected.

### `.export <query> > <file.[csv|json|parquet]>`
Execute a query and export results to a file.
```
.export MATCH (n:Person) RETURN n > /tmp/persons.csv
```
Execute via `mcp__keg-grokker__keg_query`, then write results:
```bash
# For CSV:
python3 -c "
import json, csv, sys
data = json.loads(sys.argv[1])
writer = csv.DictWriter(sys.stdout, fieldnames=data['columns'])
writer.writeheader()
writer.writerows(data['rows'])
" '<json_result>' > output.csv
```

### `.py <inline python>`
Drop into Python with the semantic layer loaded and full graph access.
```
.py from semantic_layer import SemanticGraphService; svc = SemanticGraphService('./keg'); print(svc.cache_stats)
```
Execute via Bash:
```bash
python3 -c "
import sys, os
sys.path.insert(0, '$KEG_PLUGIN_ROOT/semantic')
$PYTHON_CODE
"
```

### `.analyze <node_id_or_pattern>`
Deep node analysis — degree, centrality, neighborhood stats, property summary.
Internally calls keg_explore + keg_metrics for that node and prints a rich profile.

### `.diff <query1> <query2>`
Run two queries and diff the result sets. Useful for comparing graph states before/after
a write operation, or comparing two subgraphs.

### `.bench <query> [--runs N]`
Benchmark a query. Run it N times (default: 10), report min/median/p99/max latency.
```bash
for i in $(seq 1 $N_RUNS); do
  START=$(date +%s%N)
  # ... execute query
  END=$(date +%s%N)
  echo "$((($END - $START) / 1000000))"
done | awk '{sum+=$1; count++; if ($1>max) max=$1; if (min=="" || $1<min) min=$1} END {print "min="min"ms median=X p99=Y max="max"ms"}'
```

### `.watch <query> [--interval N]`
Re-execute a query every N seconds (default: 5) and show a diff of what changed.
Useful for monitoring live graph mutations. Runs until Ctrl+C.

### `.tx begin | commit | rollback`
Manual transaction control (where supported by the backend).

### `.history`
Show the last 50 commands executed in this shell session.

### `.help`
Show all available commands with examples.

## Direct Query Execution

If $ARGUMENTS is not a dot-command, treat the entire input as a Cypher query and execute it:
```
MATCH (a:Account)-[t:TRANSACTS]->(b:Account)
WHERE t.amount > 10000
RETURN a.id, b.id, t.amount, t.date
ORDER BY t.amount DESC
LIMIT 50
```

Execute via `mcp__keg-grokker__keg_query`. Display results as a formatted table.
Show execution time. If rows > 100, show first 100 and tell the user how to export the rest.

## Pipe Chaining (Advanced)

Support pipe-like composition using `|>`:
```
MATCH (n:Person) RETURN n.id AS id, n.risk AS risk |> .export > /tmp/risky_people.csv
MATCH (n:Person {id: 42}) RETURN n |> .analyze
```
Parse the `|>` separator, execute the left side, pass the result as input to the right side.

## Environment Variables in Queries

Support `$VAR` substitution from the shell environment:
```
MATCH (n:Person {department: '$DEPT'}) RETURN n LIMIT $LIMIT
```
Substitute from env before executing.

## Error Handling

On query error, show:
1. The exact error message from the database
2. A guess at the most likely cause (syntax error, missing node type, type mismatch)
3. A suggested fix
4. The option to run `.schema` to check available types

Never crash silently. Always explain what happened.

## Session Transcript

Maintain a transcript of all commands and results in `./keg_shell_$(date +%Y%m%d_%H%M%S).log`
unless --no-log is passed. Tell the user where the log is being saved at session start.

## Security Note

This shell executes with the permissions of the Claude Code process. Bash commands run
through the Bash tool. You can read/write files, call Python, and spawn subprocesses.
This is by design — it's a power tool. With great power comes great responsibility.
Always tell the user exactly what Bash commands you're about to run before running them.
