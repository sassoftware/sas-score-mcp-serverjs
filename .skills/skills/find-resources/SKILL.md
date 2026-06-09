---
name: find-resources
description: >
  Unified resource verification skill. Use the appropriate find tool before any execution.
  Determines server for tables (CAS vs SAS). Never use list tools for verifying or finding specific resources; list tools are for discovery and exploration only.
---

**GATE** Do not use list-* tools for verification — those are for explicit user list requests only. Always use the specific find-* tool to verify existence of a resource before attempting to use it.

# Unified Resource Finding Strategy

Use this strategy to verify that a resource exists before executing any action.
Never use `list-*` tools for verification — those are for explicit user browse requests only.

## Dotted `a.b` Resource Reference Parsing

Parse any `a.b` notation before choosing a find tool:

| `b` value | Resource type | Find tool |
|---|---|---|
| `mas` | MAS model | `sas-score-find-mas`, name=`a` |
| `job` | Job model | `sas-score-find-job`, name=`a` |
| `jobdef` | JobDef model | `sas-score-find-jobdef`, name=`a` |
| `scr` | SCR model | no find tool — ask user for URL |
| `cas` | CAS model | `sas-score-find-table({ name: name, server: 'cas' })` |
| **anything else** | **Table** | `sas-score-find-table`, lib=`a`, table=`b` |

## Find Library

**Workflow**

Use skill `find-library-server` to verify library existence and determine server. 

## Find Table

**workflow** 

Step 1. Use find-library-server skill to verify the library exists and in which server:
   - ✅ Found → return go to Step 2 
   - ❌ Not found → library does not exist; **stop** and report not found to the user

Step 2. Use sas-score-find-table tool with the library and server from step 1: `sas-score-find-table({ lib: "<lib>", name: "<TABLE_NAME>", server: <server })`
   - ✅ Found → return success with confirmed lib, table, and server
   - ❌ Not found → table does not exist; **stop** and report not found to the user

---
 

## Find Model of type MAS, Job, Jobdef, SCR, cas

**Workflow** 

Step 1. Strip any suffix (`.mas`, `.job`, `.jobdef`, `.scr`) before lookup — use the base name only.

| Type | Tool |
|---|---|
| MAS (default when type unspecified) | `sas-score-find-mas({ name })` |
| Job | `sas-score-find-job({ name })` |
| JobDef | `sas-score-find-jobdef({ name })` |
| SCR | `sas-score-find-scr({ name })` |
| cas | `sas-score-find-table({ name: name, server: 'cas' })` |

## Error Handling

- Not found → confirm spelling, library name, and server with user.
- Resource type unclear → ask: MAS, Job, JobDef, or SCR?
