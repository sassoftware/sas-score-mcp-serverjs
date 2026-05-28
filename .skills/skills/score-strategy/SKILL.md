---
name: score-strategy
description: >
  Unified scoring workflow. Handles all model types: MAS, SCR, Job, JobDef, SAS Program, CAS Program, and Macro.
  Also handles combined read+score (table rows) scenarios.
  Always verify resources before scoring (except SCR and programs).
---

# Score Strategy

## Model Types

SAS Viya supports the following model types for scoring:

| Category | Type | Suffix | Description |
|---|---|---|---|
| Analytical | MAS | `.mas` | Micro Analytic Score — real-time, low-latency scoring |
| Analytical | SCR | `.scr` | Score Code Runtime — containerized scoring endpoint |
| Execution | Job | `.job` | SAS Viya Job deployed as a scoring model |
| Execution | JobDef | `.jobdef` | SAS Viya Job Definition deployed as a scoring model |
| Execution | Program | `.sas` | SAS program executed as a scoring model |
| Execution | CAS Program | `.casl` | CASL program executed as a CAS scoring model |

## Model Type from `a.b` Notation

See request-routing skill for the canonical `a.b` parsing rule.
Short form: if `b ∈ {mas, job, jobdef, scr, sas, casl}` → model type; anything else → table reference.

## Rules

 Step 1: If table is specified as the source of the data, use read-strategy to read the data
 Step 2: Always verify the model exists with find-resources skill before attempting to score
         (Exception: programs may be scored directly without pre-verification)
 Step 3: 
  - If Step 1 and Step 2 are successful, score the data read from the table with the appropriate scoring tool based on model type.
    - Cap batch scoring at 10 rows by default; ask user before proceeding with larger batches.
  - if either Step 1 or Step 2 fails, return an error message indicating the issue (e.g. "Model X not found", "Table Y not found") and ask for corrected identifiers.

## Inline Scenario Scoring

Verify model → score with provided input values.

| Type | Tool |
|---|---|
| MAS | `sas-score-mas-score({ model, scenario })` |
| Job | `sas-score-job-score({ name, scenario })` |
| JobDef | `sas-score-jobdef-score({ name, scenario })` |
| SCR | `sas-score-scr-score({ name, scenario })` |
| Program | `sas-score-program-score({ src, scenario, folder, output, limit })` |
| CAS Program | `sas-score-cas-program-score({ src, scenario, folder, output, limit })` |
| Macro | `sas-score-macro-score({ macro, scenario })` |

## Table Row Scoring

**Parsing row count from score request**:

| User says | start | limit |
|---|---|---|
| "score the first N rows from lib.table" | 1 | N |
| "score N rows from lib.table" | 1 | N |
| (count not specified) | 1 | 10 |

**Flow**:
1. Find model →  use find-resources skill
2. Read table → use read-strategy skill
3. Score each row with the appropriate scoring tool. 
  - The tools accept a single row as input, so the skill will loop over rows and call the tool for each one.
4. Return rows with predictions appended

## Error Handling

| Error | Action |
|---|---|
| Model not found | Confirm name with user |
| Table not found | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
