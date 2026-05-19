---
name: list-resource
description: >
  Unified resource listing strategy. Use appropriate list tools for listing and browsing.
  Determines pagination parameters. Use list tools for listing only; use find tools for verification of existence or discovery.
---

# Unified Resource Listing Strategy


Use this strategy to list available resources (libraries, tables, models, jobs, jobdefs).

## Resource Type to Tool Mapping

| Resource Type | List Tool |
|--------------|-----------|
| Libraries    | sas-score-list-libraries |
| Tables       | sas-score-list-tables    |
| Models       | sas-score-list-models    |
| Jobs         | sas-score-list-jobs      |
| JobDefs      | sas-score-list-jobdefs   |

Use this table to select the correct tool for each resource type. Then follow the logic for parameters and pagination below.

## Resource Types and List Tools

### 1. List Libraries

**Trigger**: "list libraries", "show all libs", "list available libraries", "browse libraries"

**Tool**: `sas-score-list-libraries`

**Logic**:
- If server is specified: List from that server only
- If server is not specified: List from all servers (default)

**Parameters**:
```
server: "cas" | "sas" | "all"  # "cas" = CAS only, "sas" = SAS only, "all" = both
start: <offset>                 # 1-based page number (default 1)
limit: <page size>              # items per page (default 10, max varies)
where: "<filter expression>"    # optional filter
```

**Examples**:
```
# List all CAS libraries
sas-score-list-libraries({ server: "cas", start: 1, limit: 10 })

# List SAS libraries
sas-score-list-libraries({ server: "sas", start: 1, limit: 10 })

# List all libraries
sas-score-list-libraries({ server: "all", start: 1, limit: 10 })

# Pagination: show next page
sas-score-list-libraries({ server: "all", start: 11, limit: 10 })
```

---

### 2. List Tables in Library

**Trigger**: "list tables in X", "show tables in library X", "browse tables in X", "what tables are in X"

**Tool**: `sas-score-list-tables`

**Required inputs**:
- Library name
- Server (determined from library context or user specification)

**Logic**:
- If library is a known CAS library (Casuser, Public, Samples, etc.), use CAS
- If library is a known SAS library (SASHELP, WORK, SASUSER, etc.), use SAS
- If ambiguous: Ask the user to clarify. If no clarification is provided, attempt both options (CAS and SAS) and return results for each, clearly labeled by server.

**Parameters**:
```
lib: "<library>"               # Required: library name
server: "cas" or "sas"         # Determined from library
start: <offset>                # 1-based page number (default 1)
limit: <page size>             # items per page (default 10)
where: "<filter expression>"   # optional filter
```

**Examples**:
```
# List tables in Public (CAS)
sas-score-list-tables({ lib: "Public", server: "cas", start: 1, limit: 10 })

# List tables in SASHELP (SAS)
sas-score-list-tables({ lib: "SASHELP", server: "sas", start: 1, limit: 10 })

# Pagination: show next page
sas-score-list-tables({ lib: "Public", server: "cas", start: 11, limit: 10 })
```

---

### 3. List Models

**Trigger**: "list models", "show all models", "browse models", "what models are available"

**Tool**: `sas-score-list-models`

**Logic**: Lists all models published to the Model Administration Service (MAS).
- No server selection required (MAS is centralized)

**Parameters**:
```
start: <offset>  # 1-based page number (default 1)
limit: <size>    # items per page (default 10)
```

**Examples**:
```
# List first 10 models
sas-score-list-models({ start: 1, limit: 10 })

# List 25 models
sas-score-list-models({ start: 1, limit: 25 })

# Pagination: show next page
sas-score-list-models({ start: 11, limit: 10 })
```

---

### 4. List Jobs

**Trigger**: "list jobs", "show all jobs", "browse jobs", "what jobs are available"

**Tool**: `sas-score-list-jobs`

**Logic**: Lists all SAS Viya job assets.

**Parameters**:
```
start: <offset>                # 1-based page number (default 1)
limit: <page size>             # items per page (default 10)
where: "<filter expression>"   # optional filter
```

**Examples**:
```
# List first 10 jobs
sas-score-list-jobs({ start: 1, limit: 10 })

# List 25 jobs
sas-score-list-jobs({ start: 1, limit: 25 })

# Pagination: show next page
sas-score-list-jobs({ start: 11, limit: 10 })
```

---

### 5. List JobDefs

**Trigger**: "list jobdefs", "show all jobdefs", "browse jobdefs", "what jobdefs are available"

**Tool**: `sas-score-list-jobdefs`

**Logic**: Lists all SAS Viya job definition assets.

**Parameters**:
```
start: <offset>                # 1-based page number (default 1)
limit: <page size>             # items per page (default 10)
where: "<filter expression>"   # optional filter
```

**Examples**:
```
# List first 10 jobdefs
sas-score-list-jobdefs({ start: 1, limit: 10 })

# List 25 jobdefs
sas-score-list-jobdefs({ start: 1, limit: 25 })

# Pagination: show next page
sas-score-list-jobdefs({ start: 11, limit: 10 })
```

---

## Pagination Strategy

All list operations support pagination via `start` and `limit` parameters:

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `start` | number | 1 | 1-based page offset |
| `limit` | number | 10 | items per page |

**Pagination Detection**:
```
If returned items < limit
  → End of list reached
Else if returned items === limit
  → Hint: More items available. Next start = start + limit
```

**Example**:
```
List 1: start=1, limit=10 → returns 10 items
List 2: start=11, limit=10 → returns 10 items
List 3: start=21, limit=10 → returns 5 items (< limit)
        → End of list (total: 25 items)
```

---

## Decision Tree

```
User requests to list/browse resources
  ↓
What resource type?
  ├─ Libraries? → Use sas-score-list-libraries
  ├─ Tables in library X? → Use sas-score-list-tables
  ├─ Models? → Use sas-score-list-models
  ├─ Jobs? → Use sas-score-list-jobs
  └─ JobDefs? → Use sas-score-list-jobdefs
```

---

## Known Default Libraries

### CAS Libraries (server: "cas")
- Casuser
- Formats
- ModelPerformanceData
- Models
- Public
- Samples
- SystemData

### SAS Libraries (server: "sas")
- MAPS
- MAPSGFK
- MAPSSAS
- SASDQREF
- SASHELP
- SASUSER
- WORK

---

## Differences: Find vs List

| Aspect | Find | List |
|---|---|---|
| Purpose | Verify/discover existence | List available resources |
| Returns | Single resource or not found | Multiple resources with pagination |
| Use case | Before execution | Listing of resources |
| Tool suffix | `find-*` | `list-*` |
