---
name: score-cas
description: >
  Scoring workflow for CAS (Cloud Analytic Services) programs and CAS model tables.
  Use when the model suffix is .casl, or when the user references a CAS model table
  (casmodel), or when running inline CASL/CAS program src code.
  Handles both inline scenario scoring and table row scoring.
---

# Score CAS Program / CAS Model

## When to use this skill
- Model type is `.casl` (CAS Program — inline src code)
- User references a CAS model table (`casmodel` in `lib.table` form, with optional `name`)
- User says "run cas program", "execute casl", "score cas model"

## Model Forms

The tool `sas-score-cas-program-score` accepts two mutually exclusive model forms:

| Form | Params | When to use |
|---|---|---|
| Inline src code | `src` (required), no `casmodel` | User provides CASL code directly |
| CAS model table | `casmodel` (required), `name` (optional) | User references a persisted CAS model table |

> If both `src` and `casmodel` are provided, `casmodel` takes precedence.

## Tool

| Type | Verify | Score |
|---|---|---|
| CAS Program (inline) | *(no pre-check)* | `sas-score-cas-program-score` |
| CAS Model (table) | *(no pre-check)* | `sas-score-cas-program-score` |

## Inline Src Code Scoring

Score CASL source code directly (no casmodel):

```
sas-score-cas-program-score({ src, scenario, output, limit })
```

- `src` — CASL/CAS program code to execute verbatim
- `scenario` — input parameters as string (`"x=1, y=2"`) or object (`{ x: 1, y: 2 }`)
- `output` — optional CAS table name to return in response
- `limit` — max rows to return (default 100)

## CAS Model Table Scoring

Score using a persisted CAS model table:

```
sas-score-cas-program-score({ casmodel, name, scenario, output, limit })
```

- `casmodel` — CAS model table in `lib.table` form (e.g., `mylib.mymodel`)
- `name` — optional model name if different from the table name
- `scenario` — input parameters
- `output` / `limit` — same as above

## Routing Examples

| User says | Params |
|---|---|
| "run cas program `action echo`" | `{ src: "action echo" }` |
| "execute casl `action simple.summary` with table=a.b" | `{ src: "action simple.summary", scenario: { table: "a.b" } }` |
| "score cas model `mylib.abc` with x=1, y=2" | `{ casmodel: "mylib.abc", scenario: "x=1, y=2" }` |
| "score cas model `mylib.abc` using model name `mymodel`" | `{ casmodel: "mylib.abc", name: "mymodel", scenario: ... }` |

## Table Row Scoring

**Parsing row count:**

| User says | start | limit |
|---|---|---|
| "score the first N rows from lib.table" | 1 | N |
| "score N rows from lib.table" | 1 | N |
| (count not specified) | 1 | 10 |

**Flow:**
1. Read table → use read-strategy skill
2. Score each row — tool accepts a single row; loop over rows calling the tool for each
3. Return rows with predictions appended
4. Cap batch at 10 rows by default; ask user before proceeding with larger batches

## Error Handling

| Error | Action |
|---|---|
| CAS session cannot be created | Report CAS connectivity issue to user |
| `src` not provided and `casmodel` not provided | Ask user for src code or casmodel table |
| CAS model table not found | Confirm `casmodel` value with user |
| Table not found (row scoring) | Confirm table name and library |
| Empty table | Ask user to adjust filter or confirm criteria |
| Scoring failure | Return tool error verbatim |
