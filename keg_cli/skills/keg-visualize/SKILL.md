---
name: keg-visualize
description: >
  Launch, control, and interact with the real-time knowledge graph visualization server.
  Opens a force-directed D3.js graph in the browser with live WebSocket updates. Supports
  dynamic node coloring, filtering, layout switching, and export. Use when the user wants
  to visually explore, present, or record a graph. Also invoked automatically by keg-explore
  and keg-grok. Subcommands: start | stop | push | status | snapshot | reset
allowed-tools:
  - Bash
  - mcp__keg-grokker__keg_viz_start
  - mcp__keg-grokker__keg_viz_stop
  - mcp__keg-grokker__keg_visualize_push
  - mcp__keg-grokker__keg_viz_status
  - mcp__keg-grokker__keg_query
user-invocable: true
---

# /keg-visualize — Real-Time Graph Visualization Controller

You control the keg-grokker live visualization server.
Arguments: $ARGUMENTS
(Format: `<start|stop|push|status|snapshot|reset> [--port N] [--layout force|hierarchy|radial|circle] [--query "CYPHER"] [--color-by <property>] [--size-by <property>]`)

Parse the subcommand from $ARGUMENTS:

## Subcommand: start
Call `mcp__keg-grokker__keg_viz_start` with port from --port (default: $KEG_VIZ_PORT).
Report the URL back: `http://localhost:<port>`
If KEG_VIZ_AUTO_OPEN is true, the server will open the browser automatically.
Explain to the user that the graph will appear as data is pushed to it in real time,
and they can interact with it (zoom, pan, click nodes for details, drag to rearrange).

## Subcommand: stop
Call `mcp__keg-grokker__keg_viz_stop`. Confirm the server has stopped. Tell the user
any persistent snapshots taken during the session were saved to `./keg_snapshots/`.

## Subcommand: push
If --query is provided, execute the query via `mcp__keg-grokker__keg_query` first to get data.
Then call `mcp__keg-grokker__keg_visualize_push` with:
- The graph payload (nodes + edges)
- Layout preference from --layout (default: force)
- Color encoding: if --color-by is set, nodes are colored by that property value; otherwise
  color by node label/type
- Size encoding: if --size-by is set, node radius scales with that numeric property;
  otherwise size by degree centrality within the current view
The tool responds with counts of pushed nodes and edges. Confirm to the user.

## Subcommand: status
Call `mcp__keg-grokker__keg_viz_status`. Report:
- Whether the server is running and on what port
- How many nodes and edges are currently rendered
- Connected WebSocket clients
- Server uptime and memory usage

## Subcommand: snapshot
Take a snapshot of the current visualization state by calling
`mcp__keg-grokker__keg_viz_status` to confirm the server is running, then:
```bash
curl -s http://localhost:$KEG_VIZ_PORT/snapshot > ./keg_snapshots/snapshot_$(date +%Y%m%d_%H%M%S).json
```
Report the snapshot path. These snapshots are replayable — they contain the full graph
state and layout positions.

## Subcommand: reset
Call `mcp__keg-grokker__keg_visualize_push` with an empty graph payload `{nodes:[], edges:[]}`
to clear the current visualization. Confirm to the user that the canvas is cleared.

## Layout descriptions (explain to the user):
- `force`: physics-based force-directed layout — best for organic graph exploration, reveals clustering
- `hierarchy`: top-down DAG layout — best for trees, org charts, dependency graphs
- `radial`: concentric rings from a focal node — best for ego networks and neighborhood exploration
- `circle`: nodes arranged in a circle — best for seeing all edge crossings clearly on small graphs

After any operation, remind the user they can visit the viz URL to interact live.
