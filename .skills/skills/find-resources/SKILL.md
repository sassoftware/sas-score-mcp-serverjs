---
name: find-resources
description: >
  Unified resource verification skill. Use the appropriate find tool before any execution.
  Determines server for tables (CAS vs SAS). Never use list tools for verifying or finding specific resources; list tools are for discovery and exploration only.
---

# Unified Resource Finding Strategy

Use this strategy to verify that a resource exists before executing any action.
Never use `list-*` tools for verification — those are for explicit user browse or list requests only.

## Dotted `a.b` Resource Reference Parsing

Parse any `a.b` notation before choosing a find tool:

| `b` value | Resource type | Find tool |
|---|---|---|
| `mas` | MAS model | `sas-score-find-mas`, name=`a` |
| `job` | Job model | `sas-score-find-job`, name=`a` |
| `jobdef` | JobDef model | `sas-score-find-jobdef`, name=`a` |
| `scr` | SCR model | no find tool — ask user for URL |
| `sas` / `casl` | Program | not a table or model |
| **anything else** | **Table** | `sas-score-find-table`, lib=`a`, table=`b` |

## Find Table

**Tool**: `sas-score-find-table({ lib, name, server })`  
`server` is required and must be `"cas"` or `"sas"` (enforced by schema).

**Server determination**:

| Library (case-insensitive) | Server |
|---|---|
| Casuser, Formats, ModelPerformanceData, Models, Public, Samples, SystemData | `"cas"` |
| MAPS, MAPSGFK, MAPSSAS, SASDQREF, SASHELP, SASUSER, WORK | `"sas"` (uppercase lib) |
| Unknown | Try `"cas"` first; if not found, try `"sas"` with uppercased lib |

## Find Library

**Tool**: `sas-score-find-library({ name, server })`  
If server unknown: try `"cas"` first, then `"sas"` with uppercased name.

## Find Model

Strip any suffix (`.mas`, `.job`, `.jobdef`) before lookup — use the base name only.

| Type | Tool |
|---|---|
| MAS (default when type unspecified) | `sas-score-find-mas({ name })` |
| Job | `sas-score-find-job({ name })` |
| JobDef | `sas-score-find-jobdef({ name })` |
| SCR | No tool — ask user for the URL/endpoint |

## Error Handling

- Not found → confirm spelling, library name, and server with user.
- Model type unclear → ask: MAS, Job, or JobDef?
