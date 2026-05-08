---
name: detail-strategy
description: >
  Unified detail/information retrieval strategy. Handles MAS models, SCR models, and tables.
  Always verify resources exist using find-resources skill before retrieving details.
---

# Detail Strategy

Use this strategy when the user requests information about a resource: model details, schema, metadata, inputs/outputs, or any descriptive information.

## Prerequisites

1. Verify the resource exists using find-resources skill
2. Determine resource type (MAS model, SCR model, or table)

---

## Step 1: Identify Resource Type

Classify the resource based on naming convention or context:

```
model X.mas                  → MAS model (default for "model X")
model X.scr                  → SCR model
table X in library Y         → CAS or SAS table
```

---

## Step 2: Verify Resource Exists

Use find-resources skill to confirm resource exists before retrieval:

### Find MAS Model
```
find-resources skill → find-model
Tool: sas-score-find-model({ name: "<model>" })
```

### Find SCR Model
```
find-resources skill → find-scr
Tool: sas-score-find-scr({ url: "<scr-endpoint>" })
```

### Find Table
```
find-resources skill → find-table
Tool: sas-score-find-table({ lib: "<library>", name: "<table>", server: "<cas|sas>" })
```

---

## Step 3: Get Details

### Option A: MAS Model Details

**Trigger phrases**: "what inputs does model X need", "describe model X", "show variables for model X", "model X metadata", "model X information"

**Tool**: `sas-score-model-info`

**Parameters**:
```
sas-score-model-info({
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
User: "What inputs does model churnRisk need?"

1. Find: sas-score-find-model({ name: "churnRisk" })
2. Get info: sas-score-model-info({ model: "churnRisk" })
3. Return: { inputs: [...], outputs: [...], description: "..." }
```

---

### Option B: SCR Model Details

**Trigger phrases**: "what does SCR model X need", "describe SCR model X", "SCR model X inputs", "SCR model X schema"

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

## Decision Tree

```
User requests information/details
  ├─ About a MAS model?
  │   → Find model (find-resources)
  │   → Call: sas-score-model-info
  │
  ├─ About a SCR model?
  │   → Call: sas-score-scr-info (can skip verification)
  │
  └─ About a table?
      → Find table (find-resources, determine server)
      → Call: sas-score-table-info
```

---

## Implementation Checklist

For each detail/information request:

- [ ] **Classify** resource type (MAS/SCR/table)
- [ ] **Verify** resource exists (use find-resources skill, except SCR)
- [ ] **Determine** server for tables (CAS or SAS)
- [ ] **Execute** appropriate detail tool
- [ ] **Format** results (column alignment, readable structure)
- [ ] **Append** Strategy Summary to response

---

## Response Format

Always append a **Strategy Summary** to responses:

```
---

**Strategy Summary:**
- **Classification**: [Resource type identified]
- **Verification**: [Resource found or skipped (SCR)]
- **Tool Used**: [Detail tool invoked]
- **Server**: [CAS/SAS for tables, N/A for models]
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
3. Execute: `sas-score-model-info({ model: "creditScore" })`
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
