---
name: detail-strategy
description: >
  Unified detail/information/describe retrieval strategy. Handles MAS models, Job models, JobDef models, SCR models, and tables. Verify resources exist using find-resources skill before retrieving details (except SCR models, which can be queried directly).
---

# Detail Strategy

Use this strategy when the user requests information about a resource.

**Supported resource types**: MAS model, Job model, JobDef model, SCR model,  or table.

If the specified resource is ambiguous, ask the user for clarification (e.g. "Are you asking about a MAS model, a Job model, a JobDef model, a SCR model or a table?").

**Model**: If user just says "model X" without specifying type, default to MAS model (this is an explicit exception to the 'never invent' rule, but it is a predefined convention in SAS).

Verification rules
- Always verify the target resource exists using the appropriate `find-*` tool before attempting retrieval, except for SCR models (see Exceptions below).
- For tables, determine server (CAS vs SAS) during verification; if ambiguous, ask the user for the full `lib.table` or server.
- For models, strip suffixes such as `.mas`, `.job`, `.jobdef` or `.scr` before lookup to avoid lookup failures.

Defaults & exceptions
- Default model type: MAS when the user says `model X` without specifying a type.
- If verification fails, inform the user and ask for corrected or more specific identifiers.

---

## Classification & Verification Process

### Phase 1: Classify the Resource Type

Determine resource type from context/naming conventions.

**Dotted `a.b` notation rule**: parse `b` to determine type. If `b` is not in `{mas, job, jobdef, scr, sas, casl}`, treat `a.b` as a table where lib=`a`, table=`b`.

| Pattern                  | Resource Type |
|--------------------------|---------------|
| `X.mas` or `mas X` or `mas model X` | MAS model, name=X |
| `X.job` or `job X` or `job model X` | Job model, name=X |
| `X.jobdef` or `jobdef X` or `jobdef model X` | JobDef model, name=X |
| `X.scr` or `scr X` or `scr model X` | SCR model, name=X |
| `a.b` where b ∉ {mas,job,jobdef,scr,sas,casl} | **Table**: lib=a, name=b |
| `table X in library Y`   | Table X in library Y |
| `model X` (no suffix)    | Default to MAS model (explicit convention) |

If resource is ambiguous, ask user for clarification.

### Phase 2: Verify Resource Exists (Skip for SCR Models)

**IMPORTANT**: Strip the suffix if user included it, use base name for lookup (e.g. "churnRisk.mas" → "churnRisk") to avoid lookup failures.

For each resource type, use the appropriate verification tool:

| Resource Type | Tool              |
|---------------|-------------------|
| MAS model     | sas-score-find-mas |
| Job model     | sas-score-find-job   |
| JobDef model  | sas-score-find-jobdef |
| Table         | sas-score-find-table  |
| SCR model     | *(no verification needed)* |

If verification fails, inform the user and ask for additional details or corrections.

---

## Detail Retrieval Process

### Phase 3: Get Details

### Option A: MAS Model Details

**Trigger phrases**: "what inputs does mas model X need", "describe mas X", "show variables for model mas X, describe X.mas",
"mas model X metadata", "mas model X information", "describe model X" (default to MAS),
"what inputs does mas X need", "describe mas X"

**Tool**: `sas-score-mas-info`

**Parameters**:
```

sas-score-mas-info({
  model: "<model name>"
})
```

**Returns**:
- Input variables (name, type, role)
- Output variables (name, type, possible_values)
- Model type
- Description

**Example**:
```
User: "What inputs does mas model churnRisk need?"

1. Find: sas-score-find-mas({ name: "churnRisk" })
2. Get info: sas-score-mas-info({ model: "churnRisk" })
3. Return: { inputs: [...], outputs: [...], description: "..." }
```

---

### Option B: SCR Model Details

**Trigger phrases**: "what does SCR model X need", "describe SCR model X", "scr model X inputs",
"scr model X schema", "what inputs does scr model X need", "describe scr X"

**Tool**: `sas-score-scr-info`

**Parameters**:
```
sas-score-scr-info({
  url: "<scr endpoint>"
})
```

**Returns**:
- Input schema (variable names, types, required/optional)
- Output schema (prediction, probabilities, scores)
- Model metadata

**Example**:
```
User: "Show inputs for SCR model at https://scr-host/models/loan"

1. Get info: sas-score-scr-info({ url: "https://scr-host/models/loan" })
2. Return: { inputs: [...], outputs: [...] }
```

**Note**: SCR models typically do not require pre-verification (can call scr-info directly)

---

### Option C: Table Details

**Trigger phrases**: "what columns in table X", "describe table X", "show schema for table X", "table X structure", "table X metadata"

**Tool**: `sas-score-table-info`

**Parameters**:
```
sas-score-table-info({
  lib: "<library>",
  table: "<table name>",
  server: "<cas|sas>"
})
```

**Returns**:
- Columns array (name, type, label, format, length)
- Table info (rowCount, fileSize, created, modified)

**Example**:
```
User: "What columns are in the customers table in Public?"

1. Find: sas-score-find-table({ lib: "Public", name: "customers", server: "cas" })
2. Get info: sas-score-table-info({ lib: "Public", table: "customers", server: "cas" })
3. Return: { columns: [...], tableInfo: {...} }
```

---
### Option D: Job Model Details

**Trigger phrases**: "what inputs does job model X need", "describe job model X",
"show variables for job model X", "job model X metadata", "job model X information",
"what inputs does job X need", "describe job X"

**Tool**: `sas-score-job-info`

**Parameters**:
```
sas-score-job-info({
  model: "<model name>"
})
```

**Returns**:
- Input variables (name, type, role)

**Example**:
```
User: "What inputs does job model churnRisk need?"

1. Find: sas-score-find-job({ name: "churnRisk" })
2. Get info: sas-score-job-info({ model: "churnRisk" })
3. Return: { inputs: [...] }
```

### Option E: JobDef Model Details

> **Note**: There is no separate `sas-score-jobdef-info` tool. JobDef detail retrieval reuses `sas-score-job-info` — do not attempt to call a `sas-score-jobdef-info` tool.

**Trigger phrases**: "what inputs does jobdef model X need", "describe jobdef model X",
"jobdef model X metadata", "what inputs does jobdef X need", "describe jobdef X"

**Tool**: `sas-score-job-info` (shared with Job models)

**Parameters**:
```
sas-score-job-info({
  model: "<jobdef name>"
})
```

**Example**:
```
User: "What inputs does jobdef model myScorer need?"

1. Find: sas-score-find-jobdef({ name: "myScorer" })
2. Get info: sas-score-job-info({ model: "myScorer" })
3. Return: { inputs: [...] }
```

## Decision Tree

```
User requests information/details
  ├─ About a MAS model?
  │   → Verify: sas-score-find-mas
  │   → Call: sas-score-mas-info
  │
  ├─ About a SCR model?
  │   → Call: sas-score-scr-info (skip verification; validate URL first)
  │
  ├─ About a Job model?
  │   → Verify: sas-score-find-job
  │   → Call: sas-score-job-info
  │
  ├─ About a JobDef model?
  │   → Verify: sas-score-find-jobdef
  │   → Call: sas-score-job-info
  │
  └─ About a table?
      → Verify: sas-score-find-table (determine CAS or SAS server)
      → Call: sas-score-table-info
```

---

## Implementation Checklist

For each detail/information request:

- [ ] **Classify** resource type (MAS / Job / JobDef / SCR / table)
- [ ] **Verify** resource exists (use find-resources skill, except SCR)
- [ ] **Determine** server for tables (CAS or SAS)
- [ ] **Execute** appropriate detail tool
- [ ] **Format** results (column alignment, readable structure)
- [ ] **Append** Strategy Summary to response

---

## Response Format

Always append a **Strategy Summary** to responses (canonical template from `request-routing/SKILL.md`):

```
---
**Strategy Summary:**
- **Classification**: [Find / Read / Score / List / Describe]
- **Verification**: [Resources verified / skipped]
- **Tool(s)**: [Primary tool(s) invoked]
- **Decision**: [Server chosen, model type, mapping]
- **Next steps**: [Follow-ups or clarifications]
```

---

## Error Recovery

If a request fails:

1. **Resource not found** → Ask user to verify name/spelling
2. **Server mismatch** → Re-verify server location with find-resources
3. **Invalid URL (SCR)** → Ask for correct SCR endpoint URL
4. **Tool error** → Return error message verbatim and ask for clarification

---

## Examples

### Example 1: Model Information

**User**: "Describe model creditScore"

**Workflow**:
1. Classify: MAS model detail request
2. Verify: Find model creditScore → Found ✓
3. Execute: `sas-score-mas-info({ model: "creditScore" })`
4. Return: Model inputs, outputs, and description

### Example 2: SCR Model Schema

**User**: "What inputs does the SCR loan model need?"

**Workflow**:
1. Classify: SCR model detail request
2. Execute: `sas-score-scr-info({ url: "https://scr-host/models/loan" })`
3. Return: Input schema and output schema

### Example 3: Table Columns

**User**: "Show columns for customers in Public"

**Workflow**:
1. Classify: Table detail request
2. Verify: Find table customers in Public → CAS ✓
3. Execute: `sas-score-table-info({ lib: "Public", table: "customers", server: "cas" })`
4. Return: Column names, types, and table metadata
