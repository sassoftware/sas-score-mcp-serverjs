---
name: score-job-jobdef
description: >
  Scoring workflow for Job (.job) and JobDef (.jobdef) model types.
  Use when the model suffix is .job or .jobdef.
  Handles both inline scenario scoring and table row scoring.
---

# Score Job / JobDef

## When to use this skill
- Model type is `.job`
- Model type is `.jobdef`

## Tools

| Type | Verify | Score |
|---|---|---|
| Job | `sas-score-find-job` | `sas-score-job-score` |
| JobDef | `sas-score-find-jobdef` | `sas-score-jobdef-score` |

## 
## Inline Scenario Scoring


**Job:**

1. Strip suffix '.job' from the model name, if present
2. Verify: `sas-score-find-job({ name })`
3. Score: `sas-score-job-score({ name, scenario })`

**JobDef:**
1. Strip suffix '.jobdef' from the model name, if present
2. Verify: `sas-score-find-jobdef({ name })`
3. Score: `sas-score-jobdef-score({ name, scenario })`

## Table Row Scoring

**Parsing row count:**

| User says | start | limit |
|---|---|---|
| "score the first N rows from lib.table" | 1 | N |
| "score N rows from lib.table" | 1 | N |
| (count not specified) | 1 | 10 |

**Flow:**
1. Find model →
   - if job use `sas-score-find-job` to find the Job model
   - if jobdef use `sas-score-find-jobdef` to find the JobDef model
2. Read table → use read-strategy skill
3. Score each row — tools accept a single row; loop over rows calling the tool for each
4. Return rows with predictions appended
5. Cap batch at 10 rows by default; ask user before proceeding with larger batches

## Error Handling

| Error | Action |
|---|---|
| Job / JobDef not found | Confirm name with user |
| Table not found | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
