# SAS MCP Server Tools Reference

> Generated from `src/toolSet/` — May 27, 2026.  
> All tools are registered as `<brand>-<toolname>` (e.g. `sas-score-list-mas`).  
> 27 tools are loaded via `src/toolSet/makeTools.js`.

---

## Table of Contents

| Category | Tools |
|---|---|
| [MAS Models](#mas-models) | `list-mas`, `find-mas`, `mas-describe`, `mas-score` |
| [SCR Models](#scr-models) | `list-scr`, `find-scr`, `scr-describe`, `scr-score` |
| [Libraries](#libraries) | `list-libraries`, `find-library` |
| [Tables](#tables) | `list-tables`, `find-table`, `table-describe`, `read-table`, `sas-query` |
| [Jobs Models](#jobs-model) | `list-jobs`, `find-job`, `job-describe`, `job-score` |
| [Jobdef Models](#jobdef-models) | `list-jobdefs`, `find-jobdef`, `jobdef-describe`, `jobdef-score` |
| [Program Models](#program-models) | `program-score` |
| [Macro Models](#macro-models) | `macro-score` |
| [Context & Config](#context--config) | `set-context` |
| [Utilities](#utilities) | `deva-score` |

---

## MAS Models

### `list-mas`

Enumerate models published to MAS (Microanalytic Score).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'list'` | — | Required literal |
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |

**Use when:** `list models`, `list mas`, `show all models`, `next models`  
**Do not use for:** verify a specific model exists → `find-mas`; model metadata → `mas-describe`

```
list models                     → { intent: 'list', start: 1, limit: 10 }
list 25 models                  → { intent: 'list', start: 1, limit: 25 }
next models (prev start:1,limit:10) → { intent: 'list', start: 11, limit: 10 }
```

---

### `find-mas`

Locate a specific MAS model by name.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Model name (required). Strips `.mas` suffix automatically |

**Use when:** `find mas`, `does mas exist`, `is mas deployed`, `verify mas`  
**Do not use for:** listing → `list-mas`; metadata → `mas-describe`; scoring → `mas-score`

```
find mas churnRisk              → { name: 'churnRisk' }
does mas creditScore exist      → { name: 'creditScore' }
```

Returns `{ mass: [] }` if not found; `{ mass: [...] }` if found.

---

### `mas-describe`

Return detailed metadata for a deployed MAS model (inputs, outputs, types).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'describe'` | — | Required literal |
| `model` | string | — | Exact MAS model name. Strips `.mas` suffix automatically |

**Use when:** `what inputs does model need`, `describe model`, `show variables for model`  
**Do not use for:** find/list → `find-mas`/`list-mas`; scoring → `mas-score`

```
describe mas churnRisk          → { intent: 'describe', model: 'churnRisk' }
what inputs does creditScore need → { intent: 'describe', model: 'creditScore' }
describe myModel.mas            → { intent: 'describe', model: 'myModel' }
```

Returns input variable metadata (name, type, role), output variables, model description.

---

### `mas-score`

Score one or more scenarios using a model deployed on MAS.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `model` | string | — | Exact MAS model name (required). Strips `.mas` suffix |
| `scenario` | object \| string | `{}` | Input data as JSON or `"key=val, ..."` string |

**Use when:** `score with mas model`, `predict using model`, `batch scoring`  
**Do not use for:** find/list/describe — use respective tools; jobs → `job-score`

```
score mas model churn using age=45, income=60000
  → { model: 'churn', scenario: { age: 45, income: 60000 } }

predict mas model creditScore for credit=700, debt=20000
  → { model: 'creditScore', scenario: { credit: 700, debt: 20000 } }
```

Returns predictions, probabilities, and scores merged with input data.

---

## SCR Models

### `list-scr`

Enumerate models published to SCR (Score Code Runtime).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |

```
list scr                        → { start: 1, limit: 10 }
list 25 scr                     → { start: 1, limit: 25 }
```

---

### `find-scr`

Locate a specific SCR model by name.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | SCR name (required). Strips `.scr` suffix automatically |

```
find scr myscr                  → { name: 'myscr' }
does scr churn_score exist      → { name: 'churn_score' }
```

Returns `{ scr: [] }` if not found.

---

### `scr-describe`

Return input/output schema and metadata for an SCR model.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'describe'` | — | Required literal |
| `name` | string | — | SCR model name or URL (required) |

**Use when:** `describe scr`, `what inputs does scr need`, `info for scr model`

```
describe scr loan               → { intent: 'describe', name: 'loan' }
info for scr model "loan"       → { intent: 'describe', name: 'loan' }
```

Returns input variables (names, types, required/optional) and output variables.

---

### `scr-score`

Score a scenario using an SCR container model.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | SCR model name or URL (required) |
| `scenario` | object \| string | `{}` | Input values as JSON object. Omit to get model metadata |

**Use when:** `score scr model`, `score with scr`  
**Notes:** Run `scr-describe` first to inspect expected inputs.

```
score scr loan with age=45, income=60000
  → { name: 'loan', scenario: { age: 45, income: 60000 } }
```

---

## Libraries

### `list-libraries`

Enumerate CAS or SAS libraries.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'list'` | — | Required literal |
| `server` | `'cas'`\|`'sas'`\|`'all'` | `'all'` | Target environment |
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |
| `where` | string | `''` | Optional filter expression |

**Use when:** `list libraries`, `show all libs`, `browse libraries`  
**Do not use for:** verify a specific library → `find-library`; tables in a library → `list-tables`

```
list libraries                  → { intent: 'list', server: 'all', start: 1, limit: 10 }
list cas libraries              → { intent: 'list', server: 'cas', start: 1, limit: 10 }
show me 25 sas libs             → { intent: 'list', server: 'sas', limit: 25, start: 1 }
```

---

### `find-library`

Locate a specific CAS or SAS library.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Library name (required). Multi-token input → first token used |
| `server` | `'cas'`\|`'sas'` | `'cas'` | Target environment |

**Use when:** `find lib`, `does library exist`, `is library available`  
**Do not use for:** listing → `list-libraries`; tables → `list-tables`

```
find lib Public                 → { name: 'Public', server: 'cas' }
find library sasuser in sas     → { name: 'sasuser', server: 'sas' }
does library Formats exist      → { name: 'Formats', server: 'cas' }
```

Returns `{ libraries: [] }` if not found.

---

## Tables

### `list-tables`

Enumerate tables within a library.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'list'` | — | Required literal |
| `lib` | string | — | Library name (required) |
| `server` | `'cas'`\|`'sas'` | `'cas'` | Target environment |
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |
| `where` | string | `''` | Optional filter expression |

**Use when:** `list tables in <lib>`, `show tables`, `next page`  
**Do not use for:** table structure → `table-describe`; read data → `read-table`; find a table → `find-table`

```
list tables in Samples          → { intent: 'list', lib: 'Samples', start: 1, limit: 10 }
show 25 tables in sashelp       → { intent: 'list', lib: 'sashelp', limit: 25, start: 1 }
list cas tables in Public       → { intent: 'list', lib: 'Public', server: 'cas', start: 1, limit: 10 }
```

---

### `find-table`

Locate a specific table in a library.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `lib` | string | — | Library name (required) |
| `name` | string | — | Table name (required) |
| `server` | `'cas'`\|`'sas'` | `'cas'` | Target environment |

**Use when:** `find table`, `does table exist`, `verify table`  
**Do not use for:** listing → `list-tables`; schema → `table-describe`; read data → `read-table`

```
find table iris in Public       → { lib: 'Public', name: 'iris', server: 'cas' }
find table cars in sashelp in sas → { lib: 'sashelp', name: 'cars', server: 'sas' }
does customers exist in mylib   → { lib: 'mylib', name: 'customers', server: 'cas' }
```

Returns `{ tables: [] }` if not found.

---

### `table-describe`

Retrieve column metadata and table statistics.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'describe'` | — | Required literal |
| `table` | string | — | Table name (required) |
| `lib` | string | — | Library name (optional) |
| `server` | `'cas'`\|`'sas'` | `'cas'` | Target environment |

**Use when:** `what columns are in`, `describe structure`, `show schema`, `table statistics`  
**Do not use for:** read rows → `read-table`; listing tables → `list-tables`; find table → `find-table`

```
what columns are in cars        → { intent: 'describe', table: 'cars', lib: '<lib>' }
describe table sales in Public  → { intent: 'describe', table: 'sales', lib: 'Public' }
show schema for mylib.iris on sas → { intent: 'describe', table: 'iris', lib: 'mylib', server: 'sas' }
```

Returns `{ columns: [...], sampleData: [...] }`.

---

### `read-table`

Retrieve rows from a CAS or SAS table with optional filtering.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `table` | string | — | Table name (required) |
| `lib` | string | — | Library name (required) |
| `server` | `'cas'`\|`'sas'` | `'cas'` | Target environment |
| `start` | number | 1 | 1-based start row |
| `limit` | number | 10 | Max rows (1–1000) |
| `where` | string | — | SQL WHERE clause |
| `format` | boolean | true | Formatted or raw values |

**Parsing hints:**
- `"first N rows"` / `"top N rows"` → `start: 1, limit: N`
- `"rows N to M"` → `start: N, limit: M-N+1`
- `"lib.table"` dotted format → split on first dot

**Use when:** `read table`, `show rows`, `read from library`, `filtered data with WHERE`  
**Do not use for:** table schema → `table-describe`; SQL analytics → `sas-query`; listings → `list-tables`

```
read table cars in Samples      → { table: 'cars', lib: 'Samples', start: 1, limit: 10 }
show 25 rows from Public.customers → { table: 'customers', lib: 'Public', limit: 25, start: 1 }
read from mylib.orders where status='shipped'
  → { table: 'orders', lib: 'mylib', where: "status='shipped'", start: 1, limit: 10 }
read row 15 from employees in mylib on sas
  → { table: 'employees', lib: 'mylib', start: 15, limit: 1, server: 'sas' }
```

Returns `{ rows: [...], total, filtered_count, columns }`.

---

### `sas-query`

Convert a natural language question into a PROC SQL query and execute it.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `table` | string | — | Table in `lib.table` format (required) |
| `query` | string | — | Natural language question (required) |
| `sql` | string | — | Pre-generated SQL SELECT (LLM must generate if omitted) |
| `job` | string | `'program'` | Job name to execute query through |

**Workflow:** natural language → SQL SELECT → execute → return rows + log  
**Use when:** `how many`, `count/total/average by`, `aggregated analytics`, `statistical summaries`  
**Do not use for:** raw row reads without aggregation → `read-table`; schema → `table-describe`

```
how many cars by make in sashelp.cars
  → { table: 'sashelp.cars', query: '...', sql: 'SELECT make, COUNT(*) FROM sashelp.cars GROUP BY make' }

total sales by region from mylib.sales
  → { table: 'mylib.sales', query: '...', sql: 'SELECT region, SUM(amount) FROM mylib.sales GROUP BY region' }
```

Returns rows array, column metadata, and SAS log.

---

## Jobs Model

### `list-jobs`

Enumerate SAS Viya job assets.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'list'` | — | Required literal |
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |
| `where` | string | `''` | Optional filter |

```
list jobs                       → { intent: 'list', start: 1, limit: 10 }
list 25 jobs                    → { intent: 'list', start: 1, limit: 25 }
next jobs                       → { intent: 'list', start: 11, limit: 10 }
```

---

### `find-job`

Locate a specific job by name.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Job name (required). Strips `.job` suffix automatically |

```
find job cars_job_v4            → { name: 'cars_job_v4' }
does job ETL exist              → { name: 'ETL' }
find cars_job_v4.job            → { name: 'cars_job_v4' }
```

Returns `{ jobs: [] }` if not found.

---

### `job-describe`

Return metadata about a specific job (inputs, outputs, description).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'describe'` | — | Required literal |
| `name` | string | — | Job name (required). Strips `.job` suffix |

**Use when:** `describe job`, `show job details`, `what does job X do`  
**Do not use for:** find/verify → `find-job`; list → `list-jobs`; execute → `job-score`

```
describe job cars_job_v4        → { intent: 'describe', name: 'cars_job_v4' }
info for job metricsRefresh     → { intent: 'describe', name: 'metricsRefresh' }
```

---

### `job-score`

Execute a deployed SAS Viya job with optional input parameters.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Job name (required). Strips `.job` suffix |
| `scenario` | object \| string | `{}` | Input parameters as JSON or `"key=val, ..."` |

**Use when:** `score job`, `run job`, `execute job`  
**Do not use for:** arbitrary SAS code → `program-score`; macros → `macro-score`

```
score job xyz                   → { name: 'xyz' }
run job monthly_etl with month=10, year=2025
  → { name: 'monthly_etl', scenario: { month: 10, year: 2025 } }
score xyz.job with month=10, year=2025
  → { name: 'xyz', scenario: { month: 10, year: 2025 } }
```

Returns log output, listings, and tables from the job.

---

## Jobdef Models

### `list-jobdefs`

Enumerate SAS Viya job definition assets.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'list'` | — | Required literal |
| `limit` | number | 10 | Page size |
| `start` | number | 1 | 1-based offset |
| `where` | string | `''` | Optional filter |

```
list jobdefs                    → { intent: 'list', start: 1, limit: 10 }
list 25 jobdefs                 → { intent: 'list', start: 1, limit: 25 }
```

---

### `find-jobdef`

Locate a specific job definition by name.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Jobdef name (required). Strips `.jobdef` suffix automatically |

```
find jobdef metricsRefresh      → { name: 'metricsRefresh' }
does jobdef ETL exist           → { name: 'ETL' }
```

Returns `{ jobdefs: [] }` if not found.

---

### `jobdef-describe`

Return metadata for a specific job definition.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intent` | `'describe'` | — | Required literal |
| `name` | string | — | Jobdef name (required). Strips `.jobdef` suffix |

**Use when:** `describe jobdef`, `info for jobdef`, `what does jobdef X do`

```
describe jobdef cars_job_v4     → { intent: 'describe', name: 'cars_job_v4' }
describe metricsRefresh.jobdef  → { intent: 'describe', name: 'metricsRefresh' }
```

---

### `jobdef-score`

Execute a deployed SAS Viya job definition with optional input parameters.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Jobdef name (required) |
| `scenario` | object \| string | `{}` | Input parameters as JSON or `"key=val, ..."` |

**Use when:** `score jobdef`, `run jobdef`, `execute jobdef`

```
score jobdef xyz                → { name: 'xyz' }
score jobdef monthly_report with month=10, year=2025
  → { name: 'monthly_report', scenario: { month: 10, year: 2025 } }
```

Returns log output, listings, and tables from the jobdef.

---

## Program Models

### `program-score`

Execute arbitrary SAS code or stored `.sas` programs on a SAS Viya compute server.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `src` | string | — | SAS code or `.sas` filename (required) |
| `folder` | string | `''` | Server folder path (used when `src` is a filename) |
| `scenario` | string \| object | — | Input parameters as `"key=val, ..."` or `{key: val}` |
| `output` | string | `''` | Table name to capture and return as JSON |
| `limit` | number | 100 | Max rows from output table |

**Use when:** `score program`, `execute SAS code`, `run .sas file`  
**Do not use for:** macros → `macro-score`; jobs → `job-score`; SQL → `sas-query`; read rows → `read-table`

```
score program 'data a; x=1; run;'
  → { src: 'data a; x=1; run;' }

score sas file sample in /Public/models output=A limit=50
  → { src: 'sample', folder: '/Public/models', output: 'A', limit: 50 }

score program with name='John', age=45
  → { src: '<code>', scenario: { name: 'John', age: 45 } }
```

Returns log, ODS output, and (if `output` set) rows from the named table.

---

## Macro Models

### `macro-score`

Submit and execute a SAS macro on the SAS Viya compute server.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `macro` | string | — | Macro name without `%` prefix (required) |
| `scenario` | string | `''` | Parameters as `"x=1, y=abc"` or raw SAS `%let` statements |

**Scenario handling:**
- `"x=1, y=2"` → auto-converted to `%let x=1; %let y=2;`
- `"%let x=1; %let y=2;"` → passed through unchanged

**Use when:** `score macro`, `execute macro with parameters`  
**Do not use for:** arbitrary SAS code → `program-score`; jobs → `job-score`

```
score macro abc                 → { macro: 'abc' }
score macro summarize with x=1, y=2
  → { macro: 'summarize', scenario: 'x=1, y=2' }
score macro xyz with %let a=1; %let b=2;
  → { macro: 'xyz', scenario: '%let a=1; %let b=2;' }
```

Returns log, ODS output, and tables created by the macro.

---

## Context & Config

### `set-context`

Set or query the active CAS and SAS server contexts for all subsequent tool calls.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cas` | string | — | CAS server name (optional) |
| `sas` | string | — | SAS compute context name (optional) |

Call with no parameters to return the current context.

**Use when:** `switch CAS server`, `change compute context`, `what context am I using`  
**Do not use for:** retrieve env variables → `get-env`; read data → `read-table`

```
use finance-cas-server          → { cas: 'finance-cas-server' }
switch to SAS Studio Compute Context → { sas: 'SAS Studio Compute Context' }
use finance-cas for CAS and batch-compute for SAS
  → { cas: 'finance-cas', sas: 'batch-compute' }
what context am I using         → { }
```

Returns `{ cas: <current>, sas: <current> }`.

---

## Utilities

### `deva-score`

Compute a numeric score using the formula `(a + b) × 42`. Use for health checks and demos.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `a` | number | — | First input (required) |
| `b` | number | — | Second input (required) |

**Formula:** `score = (a + b) * 42`  
**Multiple numbers:** chain calls left-to-right — `call(first, second)`, then `call(result, third)`

```
deva-score a=5 b=10             → { score: 630 }
deva-score a=1 b=2              → { score: 126 }
```

Returns `{ score: number }`.

---

## Common Patterns

### Discovery → Inspect → Act

```
list-*      → browse available resources
find-*      → verify a specific resource exists
*-describe  → inspect metadata (inputs, outputs, schema)
score-* / read-* → execute or retrieve data
```

### Pagination

All `list-*` tools use 1-based pagination:

```
Page 1: { start: 1,  limit: 10 }
Page 2: { start: 11, limit: 10 }
Page N: { start: (N-1)*limit + 1, limit: limit }
```

If the returned count equals `limit`, more rows may be available.

### Server Targeting

| Value | Meaning |
|---|---|
| `'cas'` | CAS in-memory server (default for most tools) |
| `'sas'` | SAS compute server |
| `'all'` | Both (supported by `list-libraries` only) |

Change the active server with `set-context`.

### Scenario Input Formats

All scoring tools accept these equivalent formats:

```
String:  "age=45, income=60000"
Object:  { age: 45, income: 60000 }
Array:   [{ age: 45, income: 60000 }]   ← first element is used
```

### `.ext` Suffix Stripping

Tools automatically strip recognised file-type suffixes from name parameters:

| Tool | Stripped suffix |
|---|---|
| `find-job`, `job-score`, `job-describe` | `.job` |
| `find-jobdef`, `jobdef-score`, `jobdef-describe` | `.jobdef` |
| `find-mas`, `mas-describe`, `mas-score` | `.mas` |
| `find-scr`, `scr-score` | `.scr` |

---

## Tool Count Summary

| Category | Count | Tool names |
|---|---|---|
| MAS Models | 4 | `list-mas`, `find-mas`, `mas-describe`, `mas-score` |
| SCR Models | 4 | `list-scr`, `find-scr`, `scr-describe`, `scr-score` |
| Libraries | 2 | `list-libraries`, `find-library` |
| Tables | 5 | `list-tables`, `find-table`, `table-describe`, `read-table`, `sas-query` |
| Jobs Model | 4 | `list-jobs`, `find-job`, `job-describe`, `job-score` |
| Jobdef Models | 4 | `list-jobdefs`, `find-jobdef`, `jobdef-describe`, `jobdef-score` |
| Program Models | 1 | `program-score` |
| Macro Models | 1 | `macro-score` |
| Context & Config | 1 | `set-context` |
| Utilities | 1 | `deva-score` |
| **Total** | **27** | |

---

*Source: `src/toolSet/makeTools.js` — @sassoftware/sas-score-mcp-serverjs*
