---
name: request-routing
description: >
  Route SAS Viya requests for finding resources, reading tables, running queries,
  scoring MAS/job/jobdef/SCR models, listing resources, and describing metadata.
  Use when the task involves choosing the correct SAS Viya tool or deciding whether
  to verify, read, query, score, list, or describe a resource.
---

# Request Routing â€” Canonical SKILL

Purpose: single source-of-truth for routing SAS Viya actions (read, query, score, describe, list).

## Dotted Resource Reference Parsing — `a.b` Notation

When any resource reference appears in the form `a.b`, parse `b` to determine the resource type:

| `b` value | Resource type | Parsed as |
|---|---|---|
| `mas` | MAS model | name = `a` |
| `job` | Job model | name = `a` |
| `jobdef` | JobDef model | name = `a` |
| `scr` | SCR model | name = `a` |
| `sas` | SAS program model | program name = `a` |
| `casl` | CAS program model | program name = `a` |
| **anything else** | **Table** | lib = `a`, table = `b` |

**Rule**: if `b` is not one of `{mas, job, jobdef, scr, sas, casl}`, treat `a.b` as a table reference where `a` is the library name and `b` is the table name.

**Examples**:
- `Public.customers` → table, lib=`Public`, table=`customers`
- `SASHELP.cars` → table, lib=`SASHELP`, table=`cars`
- `churnRisk.mas` → MAS model, name=`churnRisk`
- `simplejob.job` → Job model, name=`simplejob`
- `myScorer.jobdef` → JobDef model, name=`myScorer`
- `loanModel.scr` → SCR model, name=`loanModel`

Quick workflow
- Verify â€” confirm resources exist (use find-*).
- Execute â€” run the mapped execution tool (read, query, score, describe, list).
- Format â€” return results and append a short Strategy Summary.

**Important Reminder**: If the category is "Find resource" do not use the list-* rules below, use the specific find-* tool for that resource type. The list-* tools are for discovery when the user does not have a specific resource in mind.

Classification
| Category | Triggers | Primary Action | Primary Tool(s) |
|---|---|---|---|
| Find resource | "find", "does X exist", "locate", "verify" | Verify resource | `sas-score-find-library`, `sas-score-find-table`, `sas-score-find-mas`, `sas-score-find-job`, `sas-score-find-jobdef` |
| Read / Query | "read", "show rows", "how many", "count", "average", "query" | Read / aggregate | `sas-score-read-table`, `sas-score-sas-query` |
| Score | "score", "predict", "run model" | Score inputs | `sas-score-mas-score`, `sas-score-scr-score`, `sas-score-job-score`, `sas-score-jobdef-score`, `sas-score-program-score`, `sas-score-cas-program-score` |
| List / Discover | "list", "show all", "browse" | List resources | `sas-score-list-*` tools (e.g., `sas-score-list-mas`, `sas-score-list-jobs`) |
| Describe | "describe", "what inputs", "metadata" | Return metadata | `sas-score-*-describe` (mas/job/jobdef/scr/table) |

Verification rules
- Always verify resources using the appropriate `find-*` tool before executing actions

Execution rules
- Execute only after verification; choose the execution tool per the Execute mapping section.
- Scoring flows:
  - Inline scenario: verify model â†’ call scoring tool.
  - Table rows: verify model + table â†’ read rows â†’ map columns to model inputs â†’ score â†’ merge predictions with rows.
- Read/query flows:
  - Use `sas-score-read-table` for **all** row reads, including those with a WHERE filter. A filter condition is not a reason to use sas-query.
  - Use `sas-score-sas-query` **only** when the request requires SQL aggregation (COUNT, SUM, AVG, MIN, MAX), GROUP BY, JOIN across tables, or computed columns.
  - When mapping between table columns and model inputs is ambiguous, ask the user for explicit mapping.

Defaults & exceptions
- Default model type: MAS unless the user specifies otherwise.
- Skip `find-*` verification for SCR models; SCR endpoints may be scored directly.
- If server determination is ambiguous, prompt the user for clarification.
- Pagination: always pass `start=1` and `limit=10` when calling any tool that accepts these parameters, unless the user specifies different values. Never omit them and rely on tool-level defaults.

Execute mapping (concise)
- Read rows (including WHERE filter): `sas-score-read-table` (lib, table, server, where)
- SQL aggregation/join only: `sas-score-sas-query` (lib.table, query, sql)
- MAS scoring: `sas-score-mas-score` (mas, scenario)
- Job scoring: `sas-score-job-score` (name, scenario)
- JobDef scoring: `sas-score-jobdef-score` (name, scenario)
- SCR scoring: `sas-score-scr-score` (name, scenario)
- Program scoring: `sas-score-program-score` (src, scenario, folder, output, limit)
- CAS Program scoring: `sas-score-cas-program-score` (src, scenario, folder, output, limit)
- Describe: `sas-score-*-describe` (mas/job/jobdef/scr/table)

Combined Read + Score (short)
1. Verify: find table (server) and find the model (mas,job,jobdef,scr). If table/model not found, ask user to clarify resource and server.  
2. Read: fetch rows (read-table or sas-query).
3. Map: ensure table columns match model inputs; ask for mapping if needed.
4. Score: call the appropriate scoring tool.
5. Merge: attach predictions to rows and return.

Strategy Summary (append to responses)
---
**Strategy Summary:**
- **Classification**: [Find / Read / Score / List / Describe]
- **Verification**: [Resources verified / skipped]
- **Tool(s)**: [Primary tool(s) invoked]
- **Decision**: [Server chosen, model type, mapping]
- **Next steps**: [Follow-ups or clarifications]
---

Error handling (short)
- Resource not found â†’ ask for exact resource name and server (for tables).
- Column/input mismatch â†’ request mapping from user.
- Empty result â†’ ask to relax filters or confirm criteria.
- Execution error â†’ return tool error verbatim.

Examples (minimal)
- Read: "read customers in Public" â†’ find Public (CAS) â†’ read-table â†’ return rows.
- Score inline: "score a=1,b=2 with job simplejob" â†’ find job â†’ job-score â†’ return merged result.
- Score table: "score Public.customers with model risk" â†’ find table (CAS) & model (MAS) â†’ read rows â†’ score â†’ return merged.

Notes: Keep this SKILL as the canonical, compact router; agent wrappers should be short and reference this document for details and examples.

