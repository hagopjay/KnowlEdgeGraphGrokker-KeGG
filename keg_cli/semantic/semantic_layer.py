#!/usr/bin/env python3
"""
keg-grokker Semantic Layer
═════════════════════════
A sophisticated semantic layer over Kuzu (and extensible to Neo4j/FalkorDB).
Based on the architecture described in the plugin's design document.

Usage from keg-shell:
    .py from semantic_layer import SemanticGraphService, GraphOntology, NodeType, EdgeType
    .py svc = SemanticGraphService('./my_db'); results = svc.explore('Person', 42, hops=3)

Usage from Python scripts:
    python3 semantic_layer.py --db ./my_db --query "MATCH (n) RETURN n LIMIT 10"
"""

import sys
import json
import argparse
import logging
from dataclasses import dataclass, field
from typing import Optional, Any
from enum import Enum

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# ONTOLOGY LAYER
# ──────────────────────────────────────────────────────────────

class Cardinality(Enum):
    ONE_TO_ONE   = "1:1"
    ONE_TO_MANY  = "1:N"
    MANY_TO_MANY = "N:M"

@dataclass
class NodeType:
    name: str
    properties: dict[str, str]        # property → Kuzu type
    primary_key: str
    description: str = ""
    pii_fields: list[str] = field(default_factory=list)

@dataclass
class EdgeType:
    name: str
    from_type: str
    to_type: str
    properties: dict[str, str]
    cardinality: Cardinality = Cardinality.MANY_TO_MANY
    description: str = ""

@dataclass
class TraversalRule:
    name: str
    description: str
    path_pattern: list[str]           # [NodeType, EdgeType, NodeType, ...]
    max_hops: int = 5

class GraphOntology:
    """Schema + semantic knowledge about the graph."""

    def __init__(self):
        self.node_types:       dict[str, NodeType]      = {}
        self.edge_types:       dict[str, EdgeType]      = {}
        self.traversal_rules:  dict[str, TraversalRule] = {}
        self.domain_concepts:  dict[str, str]           = {}   # concept → Cypher fragment

    def add_node_type(self, nt: NodeType):        self.node_types[nt.name] = nt
    def add_edge_type(self, et: EdgeType):        self.edge_types[et.name] = et
    def add_traversal_rule(self, tr: TraversalRule): self.traversal_rules[tr.name] = tr
    def define_concept(self, name: str, cypher: str): self.domain_concepts[name] = cypher

    def generate_schema_cypher(self) -> list[str]:
        stmts = []
        for nt in self.node_types.values():
            props = ", ".join(f"{k} {v}" for k, v in nt.properties.items())
            stmts.append(
                f"CREATE NODE TABLE IF NOT EXISTS {nt.name}"
                f"({props}, PRIMARY KEY({nt.primary_key}))"
            )
        for et in self.edge_types.values():
            props = ", ".join(f"{k} {v}" for k, v in et.properties.items())
            props_clause = f", {props}" if props else ""
            stmts.append(
                f"CREATE REL TABLE IF NOT EXISTS {et.name}"
                f"(FROM {et.from_type} TO {et.to_type}{props_clause})"
            )
        return stmts

# ──────────────────────────────────────────────────────────────
# CYPHER BUILDER
# ──────────────────────────────────────────────────────────────

class CypherBuilder:
    """Builds optimized Cypher from high-level specs."""

    def __init__(self, ontology: GraphOntology):
        self.ontology = ontology

    def neighborhood(
        self,
        node_type: str,
        node_key: Any,
        hops: int = 2,
        direction: str = "both",
        edge_types: list[str] | None = None,
        filters: dict | None = None,
        limit: int = 5000,
    ) -> str:
        pk = self.ontology.node_types[node_type].primary_key if node_type in self.ontology.node_types else "id"
        val = f"'{node_key}'" if isinstance(node_key, str) else node_key
        rel_filter = ":" + "|".join(edge_types) if edge_types else ""

        match direction:
            case "out":  rel = f"-[r{rel_filter}*1..{hops}]->"
            case "in":   rel = f"<-[r{rel_filter}*1..{hops}]-"
            case _:      rel = f"-[r{rel_filter}*1..{hops}]-"

        q = f"MATCH path = (start:{node_type} {{{pk}: {val}}}){rel}(end)"

        if filters:
            clauses = []
            for f_key, f_val in (filters or {}).items():
                if isinstance(f_val, dict):
                    op_map = {"gt":">","lt":"<","gte":">=","lte":"<=","eq":"=","neq":"<>"}
                    for op, v in f_val.items():
                        clauses.append(f"end.{f_key} {op_map[op]} {v}")
                else:
                    fv = f"'{f_val}'" if isinstance(f_val, str) else f_val
                    clauses.append(f"end.{f_key} = {fv}")
            q += "\nWHERE " + " AND ".join(clauses)

        q += f"\nRETURN DISTINCT end\nLIMIT {limit}"
        return q

    def pattern_match(self, pattern: list[dict]) -> str:
        """
        High-level pattern match builder.
        pattern = [
            {'type': 'Person', 'alias': 'a', 'filters': {'risk': {'gt': 0.7}}},
            {'edge': 'KNOWS'},
            {'type': 'Person', 'alias': 'b'},
        ]
        """
        match_parts, where_parts, return_aliases = [], [], []
        i = 0
        for item in pattern:
            if "type" in item:
                alias = item.get("alias", f"n{i}")
                match_parts.append(f"({alias}:{item['type']})")
                return_aliases.append(alias)
                for f_key, f_val in item.get("filters", {}).items():
                    op_map = {"gt":">","lt":"<","gte":">=","lte":"<=","eq":"=","neq":"<>"}
                    if isinstance(f_val, dict):
                        for op, v in f_val.items():
                            where_parts.append(f"{alias}.{f_key} {op_map[op]} {v}")
                    else:
                        fv = f"'{f_val}'" if isinstance(f_val, str) else f_val
                        where_parts.append(f"{alias}.{f_key} = {fv}")
                i += 1
            elif "edge" in item:
                rel_alias = item.get("alias", f"r{i}")
                match_parts.append(f"-[{rel_alias}:{item['edge']}]->")
                i += 1

        q = "MATCH " + "".join(match_parts)
        if where_parts:
            q += "\nWHERE " + " AND ".join(where_parts)
        q += "\nRETURN " + ", ".join(return_aliases) + "\nLIMIT 10000"
        return q

# ──────────────────────────────────────────────────────────────
# QUERY CACHE
# ──────────────────────────────────────────────────────────────

import hashlib, time, threading

class QueryCache:
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: dict = {}
        self._lock = threading.Lock()
        self._hits = self._misses = 0

    def _key(self, query: str, params: dict | None = None) -> str:
        raw = query + json.dumps(params or {}, sort_keys=True)
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def get(self, query: str, params: dict | None = None):
        k = self._key(query, params)
        with self._lock:
            if k in self._cache:
                entry = self._cache[k]
                if time.time() - entry["ts"] < entry["ttl"]:
                    self._hits += 1
                    return entry["result"]
                del self._cache[k]
            self._misses += 1
        return None

    def put(self, query: str, result, params: dict | None = None, ttl: int | None = None):
        k = self._key(query, params)
        with self._lock:
            if len(self._cache) >= self.max_size:
                oldest = min(self._cache, key=lambda x: self._cache[x]["ts"])
                del self._cache[oldest]
            self._cache[k] = {"result": result, "ts": time.time(), "ttl": ttl or self.default_ttl}

    def invalidate(self):
        with self._lock: self._cache.clear()

    @property
    def stats(self) -> dict:
        total = self._hits + self._misses
        return {
            "size": len(self._cache),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{self._hits/total:.1%}" if total else "0%",
        }

# ──────────────────────────────────────────────────────────────
# RESULT ENRICHER
# ──────────────────────────────────────────────────────────────

class ResultEnricher:
    """Enriches DataFrames with computed graph metrics."""

    def __init__(self, conn):
        self.conn = conn

    def add_degree_centrality(self, df, node_id_col: str = "id"):
        try:
            import pandas as pd
            ids = df[node_id_col].tolist()
            id_list = ", ".join(str(i) for i in ids)
            res = self.conn.execute(
                f"MATCH (p)-[r]-() WHERE p.id IN [{id_list}] RETURN p.id AS id, COUNT(r) AS degree"
            )
            deg_df = res.get_as_df()
            return df.merge(deg_df, left_on=node_id_col, right_on="id", how="left")
        except Exception as e:
            logger.warning(f"degree_centrality failed: {e}")
            return df

    def mask_pii(self, df, pii_fields: list[str]):
        import pandas as pd
        masked = df.copy()
        for f in pii_fields:
            if f in masked.columns:
                masked[f] = masked[f].apply(
                    lambda x: hashlib.sha256(str(x).encode()).hexdigest()[:8] if pd.notna(x) else None
                )
        return masked

# ──────────────────────────────────────────────────────────────
# SEMANTIC GRAPH SERVICE  — the unified API
# ──────────────────────────────────────────────────────────────

class SemanticGraphService:
    """
    The main entrypoint for Python-based graph intelligence.
    Drop this into any Python environment for full semantic layer access.

    Quick start:
        svc = SemanticGraphService('./my_kuzu_db')
        df  = svc.explore('Person', 42, hops=2)
        df2 = svc.find_pattern([
            {'type': 'Person', 'filters': {'risk': {'gt': 0.7}}},
            {'edge': 'KNOWS'},
            {'type': 'Company'},
        ])
    """

    def __init__(
        self,
        db_path: str,
        ontology: GraphOntology | None = None,
        cache_size: int = 1000,
        cache_ttl: int = 300,
        max_connections: int = 4,
    ):
        import kuzu
        self.db = kuzu.Database(db_path)
        self._conn = kuzu.Connection(self.db)
        self.ontology = ontology or GraphOntology()
        self.cache = QueryCache(max_size=cache_size, default_ttl=cache_ttl)
        self.builder = CypherBuilder(self.ontology)
        self.enricher = ResultEnricher(self._conn)
        logger.info(f"SemanticGraphService initialized: {db_path}")

    def execute(
        self,
        query: str,
        params: dict | None = None,
        use_cache: bool = True,
        cache_ttl: int | None = None,
        enrich: bool = False,
        mask_pii: bool = False,
    ):
        """Execute any Cypher query with full semantic layer processing."""
        import pandas as pd
        if use_cache:
            cached = self.cache.get(query, params)
            if cached is not None:
                return cached

        t0 = time.perf_counter()
        if params:
            result = self._conn.execute(query, parameters=params)
        else:
            result = self._conn.execute(query)
        df = result.get_as_df()
        elapsed = (time.perf_counter() - t0) * 1000
        logger.info(f"Query: {elapsed:.1f}ms → {len(df)} rows")

        if enrich and "id" in df.columns:
            df = self.enricher.add_degree_centrality(df)

        if mask_pii and self.ontology:
            pii = [f for nt in self.ontology.node_types.values() for f in nt.pii_fields]
            if pii:
                df = self.enricher.mask_pii(df, pii)

        if use_cache:
            self.cache.put(query, df, params, cache_ttl)

        return df

    def explore(self, node_type: str, node_key: Any, hops: int = 2, **kwargs):
        """High-level neighborhood expansion."""
        q = self.builder.neighborhood(node_type, node_key, hops=hops, **kwargs)
        return self.execute(q, enrich=True)

    def find_pattern(self, pattern: list[dict]):
        """High-level pattern matching from a list of node/edge dicts."""
        q = self.builder.pattern_match(pattern)
        return self.execute(q)

    def raw(self, cypher: str, params: dict | None = None):
        """Direct Cypher passthrough, no cache, returns DataFrame."""
        result = self._conn.execute(cypher, parameters=(params or {}))
        return result.get_as_df()

    @property
    def cache_stats(self) -> dict:
        return self.cache.stats

    def close(self):
        self.db.close()

# ──────────────────────────────────────────────────────────────
# CLI ENTRYPOINT
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="keg-grokker Python semantic layer CLI")
    parser.add_argument("--db", required=True, help="Path to Kuzu database directory")
    parser.add_argument("--query", help="Cypher query to execute")
    parser.add_argument("--explore", help="Explore node: TYPE:KEY (e.g. Person:42)")
    parser.add_argument("--hops", type=int, default=2)
    parser.add_argument("--format", choices=["json", "csv", "table"], default="table")
    parser.add_argument("--cache-stats", action="store_true")
    args = parser.parse_args()

    svc = SemanticGraphService(args.db)

    if args.cache_stats:
        print(json.dumps(svc.cache_stats, indent=2))
        sys.exit(0)

    df = None
    if args.query:
        df = svc.execute(args.query)
    elif args.explore:
        parts = args.explore.split(":")
        if len(parts) == 2:
            nt, key = parts
            df = svc.explore(nt, int(key) if key.isdigit() else key, hops=args.hops)
        else:
            print(f"--explore must be TYPE:KEY, got: {args.explore}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(0)

    if df is not None:
        match args.format:
            case "json":
                print(df.to_json(orient="records", indent=2))
            case "csv":
                print(df.to_csv(index=False))
            case _:
                print(df.to_string())

    svc.close()
