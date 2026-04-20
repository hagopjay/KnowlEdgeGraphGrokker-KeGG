"use strict";
/**
 * Base GraphAdapter interface.
 * Every database backend (Kuzu, Neo4j, FalkorDB, future adapters)
 * implements this contract. The MCP server calls only these methods,
 * so adding a new database is purely additive — no MCP code changes needed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTarget = parseTarget;
exports.toCypherLiteral = toCypherLiteral;
/**
 * Parse a "target" string into a Cypher anchor pattern.
 *
 * Handles these formats:
 *   - "42"              → MATCH (n) WHERE id(n) = 42
 *   - "Person:42"       → MATCH (n:Person {id: 42})
 *   - "Person:name:Alice" → MATCH (n:Person {name: 'Alice'})
 *   - "MATCH ..."       → used as-is (user-supplied Cypher anchor)
 */
function parseTarget(target) {
    const alias = 'start_node';
    if (/^\s*MATCH\s/i.test(target)) {
        // User supplied raw Cypher — wrap it for use as an anchor
        return { anchorCypher: target, alias };
    }
    const parts = target.split(':');
    if (parts.length === 1 && /^\d+$/.test(target.trim())) {
        // Bare numeric ID
        return { anchorCypher: `MATCH (${alias}) WHERE id(${alias}) = ${parseInt(target, 10)}`, alias };
    }
    if (parts.length === 2 && /^\d+$/.test(parts[1].trim())) {
        // Label:numericId
        const [label, id] = parts;
        return { anchorCypher: `MATCH (${alias}:${label.trim()} {id: ${parseInt(id.trim(), 10)}})`, alias };
    }
    if (parts.length === 3) {
        // Label:property:value
        const [label, prop, value] = parts;
        const valClause = /^\d+$/.test(value.trim()) ? value.trim() : `'${value.trim()}'`;
        return { anchorCypher: `MATCH (${alias}:${label.trim()} {${prop.trim()}: ${valClause}})`, alias };
    }
    // Fall back: treat as a label name, find the first node with that label
    return { anchorCypher: `MATCH (${alias}:${target.trim()})`, alias };
}
/** Serialize any value to a Cypher literal string */
function toCypherLiteral(value) {
    if (typeof value === 'string')
        return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    if (value === null || value === undefined)
        return 'null';
    return `'${JSON.stringify(value)}'`;
}
//# sourceMappingURL=base.js.map