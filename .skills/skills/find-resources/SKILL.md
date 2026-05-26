---
name: find-resources
description: >
  Unified resource verification skill. Use the appropriate find tool before any execution.
  Determines server for tables (CAS vs SAS). Never use list tools for verifying or finding specific resources; list tools are for discovery and exploration only.
---

# Unified Resource Finding Strategy

Use this strategy to verify that a resource exists before executing any action.

Verification rules
- Use `find-*` tools to confirm resource existence; do not use `list-*` tools for verification.
- For tables, determine server (CAS vs SAS) from the library; if unknown, try CAS first then SAS (uppercase lib for SAS).
- For models with no explicit type, default to MAS unless the user specifies otherwise.
- SCR models require a URL/endpoint; ask the user for the endpoint rather than attempting a find.

Do **not** use list tools for verifying or finding specific resources. List tools are for discovery and exploration only, not for confirming the existence of a specific resource.

## Resource Types and Find Tools

### 1. Find Library

**Trigger**: "find library X", "does library X exist", "check if library X", "locate library X"

**Tool**: `sas-score-find-library`


**Logic**:
1. If server is specified: Use that server directly.
2. If server is not specified:
  - Step 1: Try CAS first: `sas-score-find-library({ name: "<lib>", server: "cas" })`
  - Step 2: If not found in CAS, try SAS with the library name uppercased: `sas-score-find-library({ name: "<LIB>", server: "sas" })`
  - Step 3: Report which server (or not found in either)

**Known default libraries**:
- CAS: Casuser, Formats, ModelPerformanceData, Models, Public, Samples, SystemData
- SAS: MAPS, MAPSGFK, MAPSSAS, SASDQREF, SASHELP, SASUSER, WORK

---

### 2. Find Table

**Trigger**: "find table X", "does table X exist in Y", "locate table X in library Y"

**Tool**: `sas-score-find-table`

**Required inputs**: 
- Library name
- Table name
- Server (determined from library context or user specification)

**Rule** 
1. Do not call the tool with a null or empty server. Always determine the server first using the library name or by asking the user, then call the tool with a specific server. 
2. Do not assume a default server unless explicitly instructed by the user. Always verify the server based on the library or ask the user if ambiguous.
3. Use the logic below to determine if the table exists and which server it is on before proceeding with any read or query operations.

**Logic**:
1. If you already know that the table exists in a specific server, return that result directly and skip the remaining steps.
2. Follow these steps to determine the server and verify the table:
  - Step 1: If library is a known CAS library (Casuser, Formats, ModelPerformanceData, Models, Public, Samples, SystemData), use cas as server. Lookup is case-insensitive.
  - Step 2: If library is a known SAS library (MAPS, MAPSGFK, MAPSSAS, SASDQREF, SASHELP, SASUSER, WORK), use sas as server. Uppercase the library name for SAS lookup.
  - Step 3: If the server has been identified in the previous two steps for this library, use that as the server and follow these steps
    - If server is sas, uppercase the library name and try: `sas-score-find-table({ lib: "<LIB>", name: "<table>", server: "sas" })` and return results
    - Otherwise, use the provided server: `sas-score-find-table({ lib: "<library>", name: "<table>", server: "<server>" })` and return results
3. If server is still not known:
  - Step 1: Try cas first: `sas-score-find-table({ lib: "<library>", name: "<table>", server: "cas" })`
  - Step 2: If Step 1 did not find the table, try to find the table in sas server:
    - Uppercase  with the library name
    - try `sas-score-find-table({ lib: "<LIBRARY>", name: "<table>", server: "sas" })`
  - return results 


**Output**: "Found table <table> in library <library> on <server>" or "Table <table> not found in library <library> on either cas or sas"

---

### 3. Find Scoring Model

**Trigger**: "find model X.mas", "find mas model X", "find job model X", "find jobdef model X",
"find scr model X", "does model X exist", "locate model X", "find job X", "does job X exist",
"find jobdef X", "does jobdef X exist"

**Routing** — use the model type to pick the right find tool:

| User phrase / suffix                           | Model type | Find Tool              |
|------------------------------------------------|------------|------------------------|
| `find mas model X` / `X.mas` / `mas X`         | MAS        | `sas-score-find-mas` |
| `find job model X` / `X.job` / `job X`         | Job        | `sas-score-find-job`   |
| `find jobdef model X` / `X.jobdef` / `jobdef X`| JobDef     | `sas-score-find-jobdef`|
| `find scr model X` / `X.scr` / `scr X`         | SCR        | *(no tool — ask for URL)*|


#### MAS Model

**Tool**: `sas-score-find-mas`

**Logic**: Strip `.mas` suffix if present, use base name.
```
sas-score-find-mas({ name: "<model>" })
```

#### Job Model

**Tool**: `sas-score-find-job`

**Logic**: Strip `.job` suffix if present, use base name.
```
sas-score-find-job({ name: "<job>" })
```

#### JobDef Model

**Tool**: `sas-score-find-jobdef`

**Logic**: Strip `.jobdef` suffix if present, use base name.
```
sas-score-find-jobdef({ name: "<jobdef>" })
```

#### SCR Model

**Action**: Ask user for the SCR URL/endpoint. SCR models do not have a pre-verification tool.
If the SCR URL/endpoint is invalid or missing, prompt the user to provide a valid URL.


---



## Generic Model Type Inference

If user says "find model X" without a type qualifier, infer the type from the suffix or adjective form:

| Pattern                              | Type    | Find Tool               |
|--------------------------------------|---------|-------------------------|
| `X.mas` / `mas model X` / `mas X`    | MAS     | `sas-score-find-mas`  |
| `X.job` / `job model X` / `job X`    | Job     | `sas-score-find-job`    |
| `X.jobdef` / `jobdef model X` / `jobdef X` | JobDef | `sas-score-find-jobdef` |
| `X.scr` / `scr model X` / `scr X`    | SCR     | Skip (no find tool)     |
| (none)                               | Default to MAS | `sas-score-find-mas` |

---

## Clarifying Questions

If required information is missing:
- "Which library contains the table?" (if table lookup missing library)
- "Which server? (CAS or SAS)" (if ambiguous and not a known default)
- "Is this a MAS model, Job, or JobDef?" (if model type ambiguous)

---

## Output Format

For **found** resources:
- Confirm exact resource name from tool result
- Confirm server (for CAS/SAS resources)
- Example: "Found table customers in Public library (CAS)"

For **not found** resources:
- State clearly: "Table xyz not found in library ABC on either CAS or SAS"
- Ask for verification or correction

---

## Error Handling

If tool returns empty or error:
1. Confirm the resource name spelling with user
2. For tables: Confirm library name and server
3. For models: Ask whether MAS, Job, or JobDef
4. Ask user to verify resource exists on the server
