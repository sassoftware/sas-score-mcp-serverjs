---
name: score-program
description: >
  Scoring workflow for SAS Program  and Macro model types.
  Use when the user wants to score with a SAS program , or when the user references a SAS macro by name.
  For CAS programs (casl) or CAS model tables, use score-cas instead.
  No pre-verification step — programs are scored directly.
  Handles both inline scenario scoring and table row scoring.
---

# Score SAS Program / Macro

## When to use this skill
- When the user wants to score a SAS program (`.sas`),
- User references a SAS macro by name (Macro)

  > For CAS programs (`.casl`) or CAS model tables, use the **score-cas** skill instead.

## Tools

| Type | Verify | Score |
|---|---|---|
| Program | *(no pre-check)* | `sas-score-program-score` |
| Macro | *(no pre-check)* | `sas-score-macro-score` |

## Inline Scenario Scoring

**Program (`.sas`):**
- Score directly: `sas-score-program-score({ src, scenario, folder, output, limit })`

**Macro:**
- Score directly: `sas-score-macro-score({ macro, scenario })`

> No verification step for any program type — they are executed directly.

## Table Row Scoring

**Parsing row count:**

| User says | start | limit |
|---|---|---|
| "score the first N rows from lib.table" | 1 | N |
| "score N rows from lib.table" | 1 | N |
| (count not specified) | 1 | 10 |

**Flow:**
1. Read table → use read-strategy skill
2. Score each row — tools accept a single row; loop over rows calling the tool for each
3. Return rows with predictions appended
4. Cap batch at 10 rows by default; ask user before proceeding with larger batches

## Error Handling

| Error | Action |
|---|---|
| Program source not found | Confirm `src` path or folder with user |
| Table not found | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
