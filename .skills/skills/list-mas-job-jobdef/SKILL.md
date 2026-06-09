---
name: list-mas-job-jobdef
description: >
  List MAS models, Jobs, or JobDefs in SAS Viya. Routes to the correct list tool based on resource type.
  Use only when the user explicitly wants to browse or enumerate models, jobs, or jobdefs.
---

# List MAS Models, Jobs, and JobDefs

**Trigger**: user says "list models", "show all jobs", "browse jobdefs", "enumerate MAS models", etc.

**Do not use this skill for libraries or tables** — use the `list-library` or `list-tables` skills for those.

## Workflow

| Resource | List Tool | Notes |
|---|---|---|
| MAS Models | `sas-score-list-mas` | Default when model type is unspecified |
| Jobs | `sas-score-list-jobs` | |
| JobDefs | `sas-score-list-jobdefs` | |
| SCR Models | *(no list tool)* | Explain no list tool exists; ask user for a specific SCR URL |

Call the appropriate tool directly with pagination parameters and return results.

If the user asks to list SCR Models, explain that no list tool is available for SCR Models and ask the user to provide a specific SCR URL instead.

## Pagination

For the first page pass `start=1` and `limit=10`. For subsequent pages compute `start = previous_start + limit`.
- If returned count equals `limit`: hint that more items are available and offer a next page.
- If returned count is less than `limit`: inform the user that all results have been returned.
