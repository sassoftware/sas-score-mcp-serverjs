---
name: detail-strategy
description: >
  Use this strategy when the user requests information about a resource. This is a  
  Unified detail/information/describe retrieval strategy. Handles MAS models, Job models, JobDef models, SCR models, and tables. Verify resources exist using find-resources skill before retrieving details 
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

### Phase 2: Verify Resource Exists 

**IMPORTANT**: Strip the suffix if user included it, use base name for lookup (e.g. "churnRisk.mas" â†’ "churnRisk") to avoid lookup failures.

Use find-resources skill to verify the resource exists

If verification fails, inform the user and ask for additional details or corrections.

---


### Phase 3: Get Details

### Option A: MAS Model Details

**Trigger phrases**: "what inputs does mas model X need", "describe mas X", "show variables for model mas X, describe X.mas",
"mas model X metadata", "mas model X information", "describe model X" (default to MAS),
"what inputs does mas X need", "describe mas X"

**Tool**: `sas-score-mas-describe`

**Parameters**:
```

sas-score-mas-describe({
  name: "<model name>"
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
2. Get info: sas-score-mas-describe({ name: "churnRisk" })
3. Return: { inputs: [...], outputs: [...], description: "..." }
```

---

### Option B: SCR Model Details

**Trigger phrases**: "what does SCR model X need", "describe SCR model X", "scr model X inputs",
"scr model X schema", "what inputs does scr model X need", "describe scr X"

**Tool**: `sas-score-scr-describe`

**Parameters**:
```
sas-score-scr-describe({
  name: "<scr model name>"
})
```

**Returns**:
- Input schema (variable names, types, required/optional)
- Output schema (prediction, probabilities, scores)
- Model metadata

**Example**:
```
User: "Show inputs for SCR model loan"

1. Get info: sas-score-scr-describe({ name: "loan" })
2. Return: { inputs: [...], outputs: [...] }
```

**Note**: SCR models do not require pre-verification (call scr-describe directly with the model name)

---

### Option C: Table Details

**Trigger phrases**: "what columns in table X", "describe table X", "show schema for table X", "table X structure", "table X metadata"

**Tool**: `sas-score-table-describe`

**Parameters**:
```
sas-score-table-describe({
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
2. Get info: sas-score-table-describe({ lib: "Public", table: "customers", server: "cas" })
3. Return: { columns: [...], tableDescribe: {...} }
```

---
### Option D: Job Model Details

**Trigger phrases**: "what inputs does job model X need", "describe job model X",
"show variables for job model X", "job model X metadata", "job model X information",
"what inputs does job X need", "describe job X"

**Tool**: `sas-score-job-describe`

**Parameters**:
```
sas-score-job-describe({
  name: "<model name>"
})
```

**Returns**:
- Input variables (name, type, role)

**Example**:
```
User: "What inputs does job model churnRisk need?"

1. Find: use find-resources skill to job exists
2. Get Details: sas-score-job-describe({ name: "churnRisk" })
3. Return: { inputs: [...] }
```

### Option E: JobDef Model Details

**Trigger phrases**: "what inputs does jobdef model X need", "describe jobdef model X",
"jobdef model X metadata", "what inputs does jobdef X need", "describe jobdef X"

**Tool**: `sas-score-jobdef-describe` 

**Parameters**:
```
sas-score-jobdef-describe({
  name: "<jobdef name>"
})
```

**Example**:
```
User: "What inputs does jobdef model myScorer need?"

1. Find: sas-score-find-jobdef({ name: "myScorer" })
2. Get info: sas-score-jobdef-describe({ name: "myScorer" })
3. Return: { inputs: [...] }
```

---

### Option F: SAS Program Model Details

SAS programs are treated as models — they accept parameters via `scenario` and produce scored outputs.

**Trigger phrases**: "describe sas program X", "what parameters does program X take",
"program model X info", "describe X.sas"

**Note**: SAS programs do not have a dedicated `describe` tool. If the program is wrapped in a Job, use `sas-score-job-describe`. Otherwise ask the user for parameter documentation.

---

### Option G: CAS Program Model Details

CAS programs are treated as models — they accept CASL parameters via `scenario` and produce CAS results.

**Trigger phrases**: "describe cas program X", "what parameters does cas program X take",
"cas program model X info", "describe X.casl"

**Note**: CAS programs do not have a dedicated `describe` tool. If the program is wrapped in a JobDef, use `sas-score-jobdef-describe`. Otherwise ask the user for parameter documentation.

## Decision Tree

```
User requests information/details
  â”œâ”€ About a MAS model?
  â”‚   â†’ Verify: sas-score-find-mas
  â”‚   â†’ Call: sas-score-mas-describe
  â”‚
  â”œâ”€ About a SCR model?
  â”‚   â†’ Call: sas-score-scr-describe (skip verification; use name directly)
  â”‚
  â”œâ”€ About a Job model?
  â”‚   â†’ Verify: sas-score-find-job
  â”‚   â†’ Call: sas-score-job-describe
  â”‚
  â”œâ”€ About a JobDef model?
  â”‚   â†’ Verify: sas-score-find-jobdef
  â”‚   â†’ Call: sas-score-jobdef-describe
  â”‚
  â””â”€ About a table?
      â†’ Verify: sas-score-find-table (determine CAS or SAS server)
      â†’ Call: sas-score-table-describe
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

1. **Resource not found** â†’ Ask user to verify name/spelling
2. **Server mismatch** â†’ Re-verify server location with find-resources
3. **Invalid name (SCR)** → Ask for correct SCR model name
4. **Tool error** â†’ Return error message verbatim and ask for clarification

---

## Examples

### Example 1: Model Information

**User**: "Describe model creditScore"

**Workflow**:
1. Classify: MAS model detail request
2. Verify: Find model creditScore â†’ Found âœ“
3. Execute: `sas-score-mas-describe({ model: "creditScore" })`
4. Return: Model inputs, outputs, and description

### Example 2: SCR Model Schema

**User**: "What inputs does the SCR loan model need?"

**Workflow**:
1. Classify: SCR model detail request
2. Execute: `sas-score-scr-describe({ name: "loan" })`
3. Return: Input schema and output schema

### Example 3: Table Columns

**User**: "Show columns for customers in Public"

**Workflow**:
1. Classify: Table detail request
2. Verify:  verify table exists with find-resources skill
3. Execute: `sas-score-table-describe({ lib: "Public", table: "customers", server: "$server" })` where $server is determined from verification step
4. Return: Column names, types, and table metadata


