---
name: find-resources
description: >
  Unified resource verification skill. Use the appropriate find tool before any execution.
  Determines server for tables (CAS vs SAS). Never use list tools for verifying or finding specific resources; list tools are for discovery and exploration only.
---

# Unified Resource Finding Strategy

Use this strategy to verify that a resource exists before executing any action.

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


**Logic**:
1. If you already know that the table exists in a specific server, return that result directly.
2. Otherwise, follow these steps:
  - Step 1: If library is a known CAS library (Casuser, Public, Samples, etc.), use CAS as server.
  - Step 2: If library is a known SAS library (SASHELP, WORK, SASUSER, etc.), use SAS as server.
  - Step 3: If the server has been identified in an earlier step for this library, use that as the server.
3. If server is known at this point:
  - If server is SAS, uppercase the library name and try: `sas-score-find-table({ lib: "<LIB>", name: "<table>", server: "sas" })`
  - Otherwise, use the provided server: `sas-score-find-table({ lib: "<library>", name: "<table>", server: "<server>" })`
4. If server is not known:
  - Step 1: Try CAS first: `sas-score-find-table({ lib: "<library>", name: "<table>", server: "cas" })`
  - Step 2: If not found in CAS, try SAS with the library name uppercased: `sas-score-find-table({ lib: "<LIBRARY>", name: "<table>", server: "sas" })`
5. If the table was found, report success and server.
6. If not found, report failure.

**Output**: Table server location (CAS or SAS)

---

### 3. Find MAS Model

**Trigger**: "find model X", "does model X exist", "locate model X"

**Tool**: `sas-score-find-model`

**Logic**: Strip `.mas` suffix if present, use base name
- `sas-score-find-model({ name: "<model>" })`

---

### 4. Find Job

**Trigger**: "find job X", "does job X exist", "locate job X"

**Tool**: `sas-score-find-job`

**Logic**:
- `sas-score-find-job({ name: "<job>" })`

---

### 5. Find JobDef

**Trigger**: "find jobdef X", "does jobdef X exist", "locate jobdef X"

**Tool**: `sas-score-find-jobdef`

**Logic**:
- `sas-score-find-jobdef({ name: "<jobdef>" })`

---

### 6. Find SCR Model

**Trigger**: "find scr model X", "does scr model X exist"


**Action**: Ask user for the SCR URL/endpoint. SCR models do not have a pre-verification tool.
If the SCR URL/endpoint is invalid or missing, prompt the user to provide a valid URL.


---



## Generic Model Type Inference

If user says "find model X" without a type suffix, infer the type:

| Suffix | Type | Find Tool |
|---|---|---|
| `.mas` | MAS model | `sas-score-find-model` |
| `.job` | SAS Job | `sas-score-find-job` |
| `.jobdef` | SAS JobDef | `sas-score-find-jobdef` |
| `.scr` | SCR model | Skip (no find) |
| (none) | Default to MAS | `sas-score-find-model` |

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
