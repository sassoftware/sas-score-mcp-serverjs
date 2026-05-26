---
name: score-strategy
description: >
  Unified scoring workflow. Handles MAS, Job, JobDef, SCR, and combined read+score scenarios.
  Always verify resources before scoring.
---

# Score Strategy

## Rules

- Always verify the model exists with `find-*` before scoring (except SCR — no find tool).
- For table scoring: verify both table and model; read rows first; then score each row.
- Default model type: MAS when unspecified.
- Cap batch scoring at 100 rows by default; ask user before proceeding with larger batches.

## Model Type from `a.b` Notation

See request-routing skill for the canonical `a.b` parsing rule.  
Short form: if `b ∈ {mas, job, jobdef, scr}` → model type; anything else → table reference.

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
1. Find model (find-resources)
2. Find table → determine server (find-resources)
3. Read rows: `sas-score-read-table({ lib, table, server, start, limit })`
4. Score each row with the appropriate scoring tool
5. Return rows with predictions appended

If table columns don't match model input variable names, ask the user for the column-to-variable mapping before scoring.

## Error Handling

| Error | Action |
|---|---|
| Model not found | Confirm name with user |
| Table not found | Confirm table name and library |
| Column mismatch | Ask user for column-to-input mapping |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
