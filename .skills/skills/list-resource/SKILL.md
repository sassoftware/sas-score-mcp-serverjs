---
name: list-resource
description: >
  Unified resource listing strategy. Use appropriate list tools for listing and browsing.
  Determines pagination parameters. Use list tools for listing only; use find tools for verification of existence or discovery.
---

# Unified Resource Listing Strategy



Use this strategy to list available resources (libraries, tables, models, jobs, jobdefs).

> **GATE — invoke list-* tools ONLY when the user explicitly requests to browse or enumerate resources.**
>
> **Trigger phrases that activate list-* tools**: "list X", "show all X", "show me all X", "show a list of X", "enumerate X", "browse X", "what X are available", "next page".
>
> **Never use list-* tools to**: find a named resource, verify a resource exists, check whether something exists, or as a prerequisite before scoring/reading/running. For all of those, use find-* tools instead.

Listing rules
- Use `list-*` tools for discovery and browsing only — only when the user says "list", "show list", "browse", "enumerate", or similar explicit browsing phrases.
- Never use `list-*` to verify a specific resource's existence; always use `find-*` for that.
- If the user specifies a server, list from that server; otherwise list from all servers when appropriate.
- When a library is ambiguous for table listing, attempt both CAS and SAS and label results by server, or ask the user to clarify.
- Pagination: always pass `start=1` and `limit=10` explicitly unless the user specifies different values. Never omit these parameters.


## Resource Type to Tool Mapping

| Resource Type        | Aliases / Adjective Form               | List Tool                  |
|----------------------|----------------------------------------|----------------------------|
| Libraries            | library                                | sas-score-list-libraries   |
| Tables               | table                                  | sas-score-list-tables      |
| MAS Models           | mas model, model (default)             | sas-score-list-mas         |
| Job Models           | job model, models of type job          | sas-score-list-jobs        |
| JobDef Models        | jobdef model, models of type jobdef    | sas-score-list-jobdefs     |
| SCR Models           | scr model, models of type scr          | *(no list tool available)* |

When the user says "model" as an adjective (e.g. "mas model", "job model", "jobdef model", "scr model"), route to the corresponding list tool. When the model type is unspecified, default to MAS.

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

### 3. List Scoring Models

**Trigger**: "list models", "show all models", "what models are available",
"list mas models", "list job models", "list jobdef models", "list scr models",
"list models of type mas", "list models of type job", "list models of type jobdef",
"list models of type scr", "show all scoring models"

**Routing logic** — use the model type to pick the right tool:

| User phrase                              | Model type | Tool                   |
|------------------------------------------|------------|------------------------|
| "list models" (no type)                  | MAS (default) | `sas-score-list-mas` |
| "list mas models" / "models of type mas" | MAS        | `sas-score-list-mas`   |
| "list job models" / "models of type job" | Job        | `sas-score-list-jobs`  |
| "list jobdef models" / "models of type jobdef" | JobDef | `sas-score-list-jobdefs` |
| "list scr models" / "models of type scr" | SCR        | *(no list tool — inform user)* |

#### 3a. MAS Models

**Tool**: `sas-score-list-mas`

**Logic**: Lists all models published to the Model Administration Service (MAS). No server selection required.

**Parameters**:
```
start: <offset>  # 1-based page number (default 1)
limit: <size>    # items per page (default 10)
```

**Examples**:
```
# List first 10 MAS models
sas-score-list-mas({ start: 1, limit: 10 })

# Pagination: show next page
sas-score-list-mas({ start: 11, limit: 10 })
```

#### 3b. Job Models

**Tool**: `sas-score-list-jobs`

**Logic**: Lists all SAS Viya job assets that can be used as scoring models.

**Parameters**:
```
start: <offset>                # 1-based page number (default 1)
limit: <page size>             # items per page (default 10)
where: "<filter expression>"   # optional filter
```

**Examples**:
```
# List first 10 job models
sas-score-list-jobs({ start: 1, limit: 10 })

# Pagination: show next page
sas-score-list-jobs({ start: 11, limit: 10 })
```

#### 3c. JobDef Models

**Tool**: `sas-score-list-jobdefs`

**Logic**: Lists all SAS Viya job definition assets that can be used as scoring models.

**Parameters**:
```
start: <offset>                # 1-based page number (default 1)
limit: <page size>             # items per page (default 10)
where: "<filter expression>"   # optional filter
```

**Examples**:
```
# List first 10 jobdef models
sas-score-list-jobdefs({ start: 1, limit: 10 })

# Pagination: show next page
sas-score-list-jobdefs({ start: 11, limit: 10 })
```

#### 3d. SCR Models

No list tool is available for SCR models. Inform the user and ask for a specific SCR endpoint URL if they want to work with an SCR model.


> **Note**: "list jobs" (non-model context) uses the same tool as "list job models" — see section 3b above.
> **Note**: "list jobdefs" (non-model context) uses the same tool as "list jobdef models" — see section 3c above.

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
  ├─ Models (MAS)? → Use sas-score-list-mas
  ├─ Jobs? → Use sas-score-list-jobs
  ├─ JobDefs? → Use sas-score-list-jobdefs
  └─ SCR models? → Inform user: no list tool available; ask for a specific SCR endpoint URL
```

---

## Known Default Libraries

> See the authoritative list in `find-resources/SKILL.md`. Reproduced here for quick reference.

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
| Purpose | Verify/confirm a specific resource exists | Browse/discover available resources |
| Trigger | "find X", "does X exist", "is X available", "locate X", any pre-execution check | "list X", "show all X", "browse X", "enumerate X" |
| Returns | Single resource or not found | Multiple resources with pagination |
| Use case | Before execution (scoring, reading, running) | Explicit user request to browse |
| Tool suffix | `find-*` | `list-*` |

**Rule**: if the user did not say "list", "show list", "browse", or "enumerate", do not call a list-* tool.
