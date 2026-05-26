---
name: list-resource
description: >
  Unified resource listing strategy. Use appropriate list tools for listing and browsing.
  Determines pagination parameters. Use list tools for listing only; use find tools for verification of existence or discovery.
---

# Unified Resource Listing Strategy

## Rule

**Only** invoke list-* tools when the user explicitly says "list", "show all", "show a list of", "enumerate", "browse", or "next page".

Never use list-* to verify a specific resource exists — use find-* for that.

## Resource Type → Tool

| Resource | List Tool | Notes |
|---|---|---|
| Libraries | `sas-score-list-libraries` | `server`: `'cas'`\|`'sas'`\|`'all'` (default `'all'`) |
| Tables in library | `sas-score-list-tables` | `lib` required; determine server from library name |
| MAS Models | `sas-score-list-mas` | |
| Jobs | `sas-score-list-jobs` | |
| JobDefs | `sas-score-list-jobdefs` | |
| SCR Models | *(no list tool)* | Ask user for a specific SCR URL |

## Pagination

Always pass `start=1` and `limit=10` unless the user specifies different values.  
If returned count equals `limit`: hint that more items are available; next page uses `start = start + limit`.

## Find vs List

| | find-* | list-* |
|---|---|---|
| Purpose | Verify a specific named resource exists | Browse/discover resources |
| Trigger | "find X", "does X exist", "verify X", any pre-execution check | "list X", "show all X", "browse X", "enumerate X" |
| Returns | Single resource or not found | Paginated results |

**Rule**: if the user did not say "list", "show list", "browse", or "enumerate", do not call a list-* tool.
