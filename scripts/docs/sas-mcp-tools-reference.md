# SAS MCP Server Tools Reference

## Overview

The `@sassoftware/sas-score-mcp-serverjs` package provides a comprehensive set of tools for interacting with SAS Viya environments through the Model Context Protocol (MCP). This document catalogs all 24+ available tools organized by functional category.

All tools are registered as sas-score-<toolname>

## Table of Contents

- [Model Management & Scoring](#model-management--scoring)
- [Library Management](#library-management)
- [Table Operations](#table-operations)
- [Job Management](#job-management)
- [Program Execution](#program-execution)
- [Context & Configuration](#context--configuration)
- [Utility Tools](#utility-tools)

---

## Model Management & Scoring

### list-models

Enumerate models published to MAS (Model Aggregation Service).

**Parameters:**
- `limit` (number, default: 10): Number of models to return
- `start` (number, default: 1): 1-based offset for pagination

**Usage:**
- "list models"
- "show models"
- "list 25 models"
- "next models" (pagination)

**Example:**
```
list models
list 25 models
```

---

### find-model

Locate a specific model deployed to MAS.

**Parameters:**
- `name` (string, required): Exact model name

**Usage:**
- "find model churnRisk"
- "does model creditScore exist"
- "is model sales_forecast deployed"

**Example:**
```
find model myModel
```

---

### model-info

Retrieve detailed metadata for a deployed model including input/output variables, data types, and constraints.

**Parameters:**
- `model` (string, required): Model name as published to MAS

**Returns:**
- Input variable metadata (names, types, roles, ranges)
- Output variable information
- Model type and description

**Usage:**
- "What inputs does model X need?"
- "Describe model myModel"
- "Show the variables for sales_forecast"

**Example:**
```
model-info model=churnRisk
```

---

### model-score

Score user-supplied scenario data using a MAS-published model.

**Parameters:**
- `model` (string, required): Model name
- `scenario` (string | object | array, required): Data to score
- `uflag` (boolean, optional): Prefix model fields with underscore

**Scenario formats:**
- Comma-separated: `"x=1, y=2"`
- Object: `{x: 1, y: 2}`
- Array: `[{x: 1, y: 2}, {x: 3, y: 4}]`

**Usage:**
- "Score this customer with model churnRisk"
- "Run model creditScore with age=45, income=60000"

**Example:**
```
model-score model=mycoolmodel scenario={x:1,y:2}
model-score model=cancer1 scenario="age=45, sex=M, tumor=stage2"
```

---

### scr-info

Return input/output schema and metadata for an SCR (Score Code Runtime) model.

**Parameters:**
- `name` (string, required): SCR model identifier (URL or name)

**Returns:**
- Input variables (names, types, required/optional)
- Output variables (predictions, probabilities, scores)

**Example:**
```
scr-info name="https://scr-host/models/loan"
```

---

### scr-score

Score a scenario using an SCR container model.

**Parameters:**
- `url` (string, required): SCR model identifier (URL)
- `scenario` (string | object | array, optional): Input values

**Usage:**
- Run scrInfo first to inspect expected inputs
- Omit scenario to get model metadata

**Example:**
```
scr-score url="loan" scenario="age=45, income=60000"
scr-score url="https://scr-host/models/loan" scenario={age:45, income:60000}
```

---

## Library Management

### list-libraries

Enumerate CAS or SAS libraries.

**Parameters:**
- `server` (cas|sas, default: 'cas'): Target environment
- `limit` (number, default: 10): Page size
- `start` (number, default: 1): 1-based offset
- `where` (string, optional): Filter expression

**Usage:**
- "list libs"
- "list libraries"
- "show cas libs"
- "list sas libs"

**Example:**
```
list libraries
list sas libs
show me 25 cas libraries
```

---

### find-library

Locate a specific CAS or SAS library.

**Parameters:**
- `name` (string, required): Exact library name
- `server` (cas|sas, default: 'cas'): Target environment

**Usage:**
- "find library Public"
- "does library SASHELP exist"
- "is PUBLIC library available in cas"

**Example:**
```
find lib Public
find library sasuser in sas
```

---

## Table Operations

### list-tables

Enumerate tables within a specific CAS or SAS library.

**Parameters:**
- `lib` (string, required): Library to inspect
- `server` (cas|sas, default: 'cas'): Target environment
- `limit` (number, default: 10): Page size
- `start` (number, default: 1): 1-based offset

**Usage:**
- "list tables in Samples"
- "show tables in sashelp"
- "list 25 tables in Public"

**Example:**
```
list tables in samples
show 25 tables in sashelp
```

---

### find-table

Locate a table in a specified library.

**Parameters:**
- `lib` (string, required): Library to search in
- `name` (string, required): Table name or substring
- `server` (cas|sas, default: 'cas'): Target environment

**Usage:**
- "find table iris in Public library in cas"
- "find table cars in sashelp in sas server"

**Example:**
```
find table iris in Public
find table cars in sashelp in sas
```

---

### table-info

Return metadata about a table including columns, types, and statistics.

**Parameters:**
- `table` (string, required): Table name
- `lib` (string, required): Library containing the table
- `server` (cas|sas, default: 'cas'): Target environment

**Returns:**
- Column metadata (name, type, label, formats)
- Table statistics (row count, file size, timestamps)

**Usage:**
- "describe table cars in Public"
- "info on table mydata in mylib"

**Example:**
```
table-info table=cars lib=Public
describe table air in lib sashelp on sas server
```

---

### read-table

Retrieve rows from a table in a CAS or SAS library.

**Parameters:**
- `table` (string, required): Table name
- `lib` (string, required): Library containing the table
- `server` (cas|sas, default: 'cas'): Target environment
- `start` (number, default: 1): Starting row (1-based)
- `limit` (number, default: 10): Maximum rows to return
- `where` (string, optional): SQL-style WHERE clause
- `format` (boolean, default: true): Return formatted or raw values
- `row` (number, optional): Read a specific row

**Usage:**
- "read table customers"
- "show me 10 rows from sales"
- "read from orders where status = 'shipped'"

**Example:**
```
read table cars in Samples
show 25 rows from customers
read orders where status = 'shipped' limit 50
read row 15 from employees in mylib on sas
```

---

### sas-query

Execute SQL queries on SAS tables using PROC SQL.

**Parameters:**
- `table` (string, required): Table in format libname.tablename
- `query` (string, required): Natural language query
- `sql` (string, optional): Generated SQL SELECT statement
- `job` (string, default: 'sas_sql_tool'): Job to run query on

**Workflow:**
1. User provides natural language query
2. Convert to SAS PROC SQL SELECT statement
3. Execute and return results

**Example:**
```
sasquery table=mylib.clm_dental query="Total paid amount, unique patients by procedure code"
sasquery table=mylib.students query="How many students in each year as percentage"
```

---

## Job Management

### list-jobs

Enumerate SAS Viya job assets.

**Parameters:**
- `limit` (number, default: 10): Number of jobs to return
- `start` (number, default: 1): 1-based offset
- `where` (string, optional): Filter expression

**Usage:**
- "list jobs"
- "show jobs"
- "list 25 jobs"

**Example:**
```
list jobs
list 25 jobs
```

---

### find-job

Locate a specific SAS Viya job.

**Parameters:**
- `name` (string, required): Exact job name

**Usage:**
- "find job cars_job_v4"
- "does job sales_summary exist"
- "verify job ETL_Daily"

**Example:**
```
find job cars_job_v4
```

---

### run-job

Execute a job on a SAS Viya server.

**Parameters:**
- `name` (string, required): Job name
- `scenario` (string | object, optional): Input parameters

**Returns:**
- Log, listing, and tables (depending on job definition)

**Example:**
```
run job xyz param1=10,param2=val2
run-job myjob scenario a=10,b=20
job myjob scenario a=10,b=20
```

---

### list-jobdefs

Enumerate SAS Viya job definition assets.

**Parameters:**
- `limit` (number, default: 10): Number to return
- `start` (number, default: 1): 1-based offset
- `where` (string, optional): Filter expression

**Usage:**
- "list jobdefs"
- "show job definitions"

**Example:**
```
list jobdefs
list 25 jobdefs
```

---

### find-jobdef

Locate a specific job definition.

**Parameters:**
- `name` (string, required): Exact jobdef name

**Usage:**
- "find jobdef cars_job_v4"
- "does jobdef ETL exist"

**Example:**
```
find jobdef metricsRefresh
```

---

### run-jobdef

Execute a job definition on a SAS Viya server.

**Parameters:**
- `name` (string, required): Job definition name
- `scenario` (string | object, optional): Input parameters

**Returns:**
- Log, listing, and tables

**Example:**
```
run-jobdef xyz param1=10,param2=val2
jobdef myjobdef scenario a=10,b=20
```

---

## Program Execution

### run-program

Execute arbitrary SAS code or stored programs on a SAS Viya server.

**Parameters:**
- `src` (string, required): SAS code or .sas filename
- `folder` (string, optional): Server folder path if src is a filename
- `scenario` (string | object, optional): Input parameters
- `output` (string, optional): Name of output table returned as JSON
- `limit` (number, default: 100): Max rows from output table

**Usage:**
- Direct code execution
- Running stored .sas files
- With input parameters and output capture

**Example:**
```
run program "data a; x=1; run;"
program "data work.a; x=1; run;" output=a limit=50
run program sample folder=/Public/models output=A limit=50
program sample folder=/Public/models scenario="name='John', age=45" output=a
```

---

### run-macro

Submit and execute a SAS macro on a SAS Viya server.

**Parameters:**
- `macro` (string, required): Macro name (without leading %)
- `scenario` (string, optional): Parameters or SAS setup code

**Scenario formats:**
- Comma-separated: `"x=1, y=abc"` → converted to %let statements
- Raw SAS: `"%let x=1; %let y=abc;"` → passed through unchanged

**Example:**
```
run macro abc with scenario x=1, y=2
run macro summarize with scenario %let x=1; %let y=2;
```

---

## Context & Configuration

### set-context

Set the CAS and SAS server contexts for subsequent tool calls.

**Parameters:**
- `cas` (string, optional): CAS server name
- `sas` (string, optional): SAS compute context name

**Returns:**
- Current CAS and SAS context values

**Usage:**
- Switch between server environments
- Check current context (call with no parameters)

**Example:**
```
set-context cas=finance-cas-server
set-context sas="SAS Studio Compute Context"
set-context (returns current context)
```
---

## Utility Tools

Use this to verify that the mcp server is up and running.

### deva-score

Compute a numeric score based on two input values using the formula: (a + b) × 42

**Parameters:**
- `a` (number, required): First numeric input
- `b` (number, required): Second numeric input

**Returns:**
- Numeric result: (a + b) × 42

**Usage:**
- "Calculate deva score for 5 and 10"
- For sequences: chain calls left-to-right

**Example:**
```
deva-score a=5 b=10  // returns 630
deva-score a=1 b=2   // returns 126
```

---

## Tool Categories Summary

| Category | Tool Count | Tools |
|----------|-----------|-------|
| **Model Management** | 6 | list-models, find-model, model-info, model-score, scr-info, scr-score |
| **Library Management** | 2 | list-libraries, find-library |
| **Table Operations** | 5 | list-tables, find-table, table-info, read-table, sas-query |
| **Job Management** | 6 | list-jobs, find-job, job, list-jobdefs, find-jobdef, job-def |
| **Program Execution** | 2 | run-program, run-macro |
| **Context & Config** | 1 | set-context |
| **Utilities** | 1 | deva-score |
| **Total** | **24** | |

---

## Common Patterns

### Discovery → Inspection → Action

1. **List** tools to discover available resources
2. **Find** tools to locate specific items
3. **Info** tools to inspect metadata
4. **Execution** tools to perform actions

### Pagination

Many list tools support pagination:
- First page: `{ start: 1, limit: 10 }`
- Next page: `{ start: 11, limit: 10 }`

### Server Targeting

Tools that interact with data support `server` parameter:
- `'cas'` - CAS server (default)
- `'sas'` - SAS compute server

### Scenario Input Formats

Tools accepting scenarios support multiple formats:
- **String**: `"x=1, y=2"`
- **Object**: `{x: 1, y: 2}`
- **Array**: `[{x: 1, y: 2}]`

---

## Notes

- All tools are designed to work with SAS Viya environments
- Authentication and connectivity are handled by the MCP server configuration
- Tools are stateless unless context is explicitly set using set-context
- Error handling returns structured error objects from the backend
- Case sensitivity varies by backend (library/table names may be case-insensitive)

---

*Document generated for @sassoftware/mcp-serverjs*  
*Last updated: December 2024*
