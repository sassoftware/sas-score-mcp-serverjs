---
name: score-mas-scr
description: >
  Scoring workflow for MAS (Micro Analytic Score) and SCR (Score Code Runtime) models.
  Use when the model type is .mas or .scr, or when no suffix is given (default is MAS).
  Handles both inline scenario scoring and table row scoring.
---

# Score MAS / SCR

## When to use this skill
- Model type is `.mas` (default when no suffix given)
- Model type is `.scr`

## Tools

| Type | Verify | Score |
|---|---|---|
| MAS | `sas-score-find-mas` | `sas-score-mas-score` |
| SCR | `sas-score-find-scr` | `sas-score-scr-score` |

## Inline Scenario Scoring

**MAS:**
1. Verify: `sas-score-find-mas({ model })`
2. Score: `sas-score-mas-score({ model, scenario })`

**SCR:**
1. Verify: `sas-score-find-scr({ model })`
2. Score: `sas-score-scr-score({ model, scenario })`

## Table Row Scoring

**Parsing row count:**

| User says | start | limit |
|---|---|---|
| "score the first N rows from lib.table" | 1 | N |
| "score N rows from lib.table" | 1 | N |
| (count not specified) | 1 | 10 |

**Flow:**
1. Find model → 
   - if mas use `sas-score-find-mas` to find the MAS model
   - if scr use `sas-score-find-scr` to find the SCR model
2. Read table → use read-strategy skill
3. Score each row — tools accept a single row; loop over rows calling the tool for each
4. Return rows with predictions appended
5. Cap batch at 10 rows by default; ask user before proceeding with larger batches

## Error Handling

| Error | Action |
|---|---|
| MAS model not found | Confirm model name with user |
| Table not found | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
