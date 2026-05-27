---
name: score-strategy
description: >
  Unified scoring workflow. Handles MAS, Job, JobDef, SCR, and combined read+score scenarios.
  Always verify resources before scoring.
---

# Score Strategy

## Model Type from `a.b` Notation

See request-routing skill for the canonical `a.b` parsing rule.
Short form: if `b ∈ {mas, job, jobdef, scr}` → model type; anything else → table reference.

## Rules

 Step 1: If table is specified as the source of the data, use read-strategy to read the data
 Step 2: Always verify the model exists with find-resources skill before attempting to score
 Step 3: 
  - If Step 1 and Step 2 are successful, score the data read from the table with the appropriate scoring tool based on model type.
    - Cap batch scoring at 10 rows by default; ask user before proceeding with larger batches.
  - if either Step 1 or Step 2 fails, return an error message indicating the issue (e.g. "Model X not found", "Table Y not found") and ask for corrected identifiers.

Verify model → score with provided input values.

## Inline Scenario Scoring

Verify model → score with provided input values.

| Type | Tool |
|---|---|
| MAS | `sas-score-mas-score({ model, scenario })` |
| Job | `sas-score-run-job({ name, scenario })` |
| JobDef | `sas-score-run-jobdef({ name, scenario })` |
| SCR | `sas-score-scr-score({ url, scenario })` |

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
3. Score each row with the appropriate scoring tool
4. Return rows with predictions appended

## Error Handling

| Error | Action |
|---|---|
| Model not found | Confirm name with user |
| Table not found | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
