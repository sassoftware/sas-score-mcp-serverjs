---
name: read-strategy
description: >
  Strategy for reading data from CAS or SAS tables. Determines which read tool to use (raw reads vs analytical queries).
---

# Read Table Strategy

Use this strategy when the user requests to read, fetch, or query data from a table.

## Prerequisites

Before reading:
1. Verify the table exists using FIND-RESOURCE strategy
2. Determine the server (CAS or SAS) from Step 1

---

## Two Types of Read Operations

### Type 1: Raw Row Read

**Trigger phrases**: "read rows from", "show first N records", "fetch records where", "get data from table"

**Tool**: `sas-score-read-table`

**When to use**:
- User wants raw records, not aggregations
- User wants to filter by WHERE clause
- User wants to browse data

**Parameters**:
```
lib: "<library>"           # from FIND-RESOURCE verification
table: "<table>"           # from FIND-RESOURCE verification
server: "cas" or "sas"     # from FIND-RESOURCE verification
start: <row number>        # default 1
limit: <max rows>          # default 10, max 1000
where: "<SQL WHERE clause>"  # optional filter
format: true               # default: use formatted values
```

**Example**:
```
sas-score-read-table({
  lib: "Public",
  table: "customers",
  server: "cas",
  limit: 25,
  where: "status='active'"
})
```

---

### Type 2: Analytical Query

**Trigger phrases**: "how many", "count by", "average", "total", "sum", "group by", "aggregate", "distinct", "join"

**Tool**: `sas-score-sas-query`

**When to use**:
- User wants aggregations (SUM, AVG, COUNT, etc.)
- User wants GROUP BY or distinct counts
- User wants JOIN across tables
- User wants statistical summaries

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
Is it an aggregation? (count, sum, avg, group by, distinct, etc.)
  ├─ YES → Use sas-score-sas-query
  └─ NO → Use sas-score-read-table
```

---

## Table Name Format

- **CAS tables**: `Caslib.table` or `Public.customers` (lowercase caslib, mixed case table)
- **SAS tables**: `LIBREF.table` or `SASHELP.cars` (uppercase libref, case-insensitive table)

---

## Error Handling

| Error | Action |
|---|---|
| Table not found | Verify table exists with FIND-RESOURCE first |
| Server mismatch | Use server from FIND-RESOURCE verification |
| Empty result | Ask user to adjust WHERE clause or criteria |
| Column not found | Ask user to verify column name (case sensitivity) |

---

## Examples

### Example 1: Browse customer records
**Request**: "read first 20 customers from Public"
1. Find table customers in Public → CAS
2. Read: `sas-score-read-table({ lib: "Public", table: "customers", server: "cas", limit: 20 })`
3. Return 20 rows

### Example 2: Find active customers in a region
**Request**: "fetch customers from Public where status='active' and region='East'"
1. Find table customers in Public → CAS
2. Read: `sas-score-read-table({ lib: "Public", table: "customers", server: "cas", where: "status='active' and region='East'" })`
3. Return matching rows

### Example 3: Aggregate customers by region
**Request**: "how many customers by region in Public.customers"
1. Find table customers in Public → CAS
2. Query: `sas-score-sas-query({ table: "Public.customers", query: "count of customers by region", sql: "SELECT region, COUNT(*) FROM Public.customers GROUP BY region" })`
3. Return aggregated result
