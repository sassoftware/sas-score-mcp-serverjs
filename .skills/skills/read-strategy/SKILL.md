---
name: read-strategy
description: >
  Strategy for reading data from CAS or SAS tables. Determines which read tool to use (raw reads vs analytical queries).
---

# Read Table Strategy

Use this strategy when the user requests to read, fetch, or query data from a table.

Rules summary
- Verification rules: verify the table exists using `find-*` and determine the server (CAS vs SAS); ask the user if ambiguous. Do not assume a default server unless explicitly instructed.
- Execution rules: use `sas-score-read-table` for **all** row reads, including filtered reads with WHERE clauses; use `sas-score-sas-query` **only** when the request requires SQL aggregation functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY, JOIN across tables, or computed columns. A WHERE clause alone is not enough to use sas-query — use read-table with the `where` parameter instead.
- Pagination: always pass `start=1` and `limit=10` explicitly for `sas-score-read-table` unless the user specifies different values.
- Error handling: surface clear guidance when table or column names are missing or misspelled.

## Prerequisites

Before reading:
1. Verify the table exists using find-resource strategy
2. Determine the server (CAS or SAS) from the find-resource verification step. If the server cannot be determined, ask the user to specify. Do not proceed with a default server unless explicitly instructed by the user.

---

## Two Types of Read Operations

### Type 1: Raw Row Read

**Trigger phrases**: "read rows from", "show first N records", "fetch records where", "get data from table", "score the first N rows", "browse data in", "read table", "get rows where", "show records where", "filter by", "query table where"

**Tool**: `sas-score-read-table`

**When to use**:
- User wants raw records, with or without a filter
- User wants to filter rows with a WHERE clause (this is a read-table with `where=`, not sas-query)
- User wants to browse data
- Default for any "read" or "fetch" request that does not involve aggregation or a JOIN

**Parsing Pagination from User Input**

Translate user phrasing to `start` and `limit` before calling the tool:

| User says | start | limit |
|---|---|---|
| "first N rows/records" | 1 | N |
| "top N rows" | 1 | N |
| "N rows" / "N records" (no qualifier) | 1 | N |
| "read N rows from lib.table" | 1 | N |
| "rows N to M" | N | M−N+1 |
| "starting from row N" | N | 10 (default) |
| (count not specified) | 1 | 10 (default) |

> "first" always means **start at row 1, return N rows**. It is never a row offset.

**Dotted table format**: `"lib.table"` → `lib: "lib"`, `table: "table"` (split on first dot).

**Parameters**:
```
lib: "<library>"           # from find-resource verification, or split from lib.table
table: "<table>"           # from find-resource verification, or split from lib.table
server: "cas" or "sas"     # from find-resource verification
start: <row number>        # default 1 — see parsing table above
limit: <max rows>          # default 10, max 1000 — see parsing table above
where: "<SQL WHERE clause>"  # optional filter
format: true               # default: use formatted values
```

**Example**:
```
sas-score-read-table({
  lib: "Public",
  table: "customers",
  server: "cas",
  start: 1,
  limit: 25,
  where: "status='active'"
})
```

---

### Type 2: SQL Aggregation Query

**Trigger phrases**: "how many", "count by", "count of", "average of", "total of", "sum of", "group by", "aggregate by", "join with", "join across"

**Tool**: `sas-score-sas-query`

**When to use — ONLY when the request requires one or more of**:
- SQL aggregation functions: COUNT, SUM, AVG, MIN, MAX
- GROUP BY or HAVING clauses
- JOIN across two or more tables
- Computed/derived columns (e.g. `price * qty`)
- Statistical summaries (totals, averages, distributions)

**Do NOT use for**:
- Simple filtered reads — "show customers where status='active'" → use `sas-score-read-table` with `where="status='active'"`
- Any request that just wants rows back, even with conditions
- Requests where "query" means "fetch" rather than "aggregate"

**Parameters**:
```
table: "lib.table"         # CAS: "Public.customers", SAS: "SASHELP.cars"
query: "<natural language question>"
sql: "<SELECT SQL>"        # optional: pre-generated SQL
```

**Example**:
```
sas-score-sas-query({
  table: "Public.customers",
  query: "count of customers by region and status",
  sql: "SELECT region, status, COUNT(*) as count FROM Public.customers GROUP BY region, status"
})
```

---


## Decision Tree

```
User requests data from table
  ↓
Does the request require a SQL aggregation function (COUNT/SUM/AVG/MIN/MAX),
GROUP BY, JOIN across tables, or computed columns?
  ├─ YES → Use sas-score-sas-query
  └─ NO  → Use sas-score-read-table (pass WHERE clause in `where` parameter if filtering)

Key: a WHERE clause alone → read-table. Aggregation/join → sas-query.
If still ambiguous, ask the user before proceeding.
```

---

## Table Name Format

- **CAS tables**: `Caslib.table` or `Public.customers` (mixed case table)
- **SAS tables**: `LIBREF.table` or `SASHELP.cars` (uppercase libref, case-insensitive table)
- **Dotted input**: `"x.y"` → `lib: "x"`, `table: "y"` — always split on the first dot to extract lib and table

---

## Error Handling

| Error | Action |
|---|---|
| Table not found | Verify table exists with find-resource first |
| Server mismatch | Use server from find-resource verification |
| Empty result | Ask user to adjust WHERE clause or criteria |
| Column not found | Ask user to verify column name (case sensitivity) |

---

## Examples

### Example 1: Browse customer records
**Request**: "read first 20 customers from Public"
1. Find table customers in Public → CAS
2. Read: `sas-score-read-table({ lib: "Public", table: "customers", server: "cas", start: 1, limit: 20 })`
3. Return 20 rows

### Example 2: Find active customers in a region
**Request**: "fetch customers from Public where status='active' and region='East'"
1. Find table customers in Public → CAS
2. Read: `sas-score-read-table({ lib: "Public", table: "customers", server: "cas", start: 1, limit: 10, where: "status='active' and region='East'" })`
3. Return matching rows

### Example 3: Aggregate customers by region
**Request**: "how many customers by region in Public.customers"
1. Find table customers in Public → CAS
2. Query: `sas-score-sas-query({ table: "Public.customers", query: "count of customers by region", sql: "SELECT region, COUNT(*) FROM Public.customers GROUP BY region" })`
3. Return aggregated result
