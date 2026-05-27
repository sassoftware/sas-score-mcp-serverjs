---
name: read-strategy
description: >
  Strategy for reading data from CAS or SAS tables. Determines which read tool to use (raw reads vs analytical queries).
---

# Read Table Strategy

## Rules

- Verify the table exists first using find-resources strategy.
- Use `sas-score-read-table` for **all** row reads, including filtered reads with a WHERE clause.
- Use `sas-score-sas-query` **only** when the request requires SQL aggregation (COUNT, SUM, AVG, MIN, MAX), GROUP BY, JOIN, or computed columns.
- A WHERE clause alone is not a reason to use sas-query — use read-table with the `where` parameter.

## Read Table (`sas-score-read-table`)

**When**: raw rows, filtered rows, browsing — anything that is not an aggregation or join.

**Parsing row count from user input**:

| User says | start | limit |
|---|---|---|
| "first N rows/records" | 1 | N |
| "top N rows" | 1 | N |
| "N rows" / "N records" | 1 | N |
| "rows N to M" | N | M−N+1 |
| "starting from row N" | N | 10 |
| (not specified) | 1 | 10 |

> "first" always means start at row 1 and return N rows. It is never a row offset.

**Dotted format**: `"lib.table"` → `lib: "lib"`, `table: "table"` (split on first dot).

**Parameters**: `lib`, `table`, `server` (from find-resources), `start`, `limit`, `where`

## SQL Query (`sas-score-sas-query`)

**When**: COUNT/SUM/AVG/MIN/MAX, GROUP BY, JOIN across tables, or computed columns.

**NOT for**: simple filtered reads — use read-table with `where` instead.

**Parameters**: `table` (as `"lib.table"`), `query`, `sql`

## Decision

```
Does the request need aggregation (COUNT/SUM/AVG/GROUP BY) or a JOIN?
  YES → sas-score-sas-query
  NO  → sas-score-read-table  (pass filter in `where` parameter if needed)
```

## Table Name Format

- CAS: `Public.customers`, `Caslib.table`
- SAS: `SASHELP.cars`, `LIBREF.table` (uppercase libref)
- Dotted input `"x.y"` → lib=`x`, table=`y`

## Error Handling

| Error | Action |
|---|---|
| Table not found | Verify with find-resources first |
| Empty result | Ask user to adjust WHERE clause |
| Column not found | Ask user to verify column name (case-sensitive) |
