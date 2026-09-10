---
name: list-tables
description: >
  List tables in a SAS Viya library. Always verifies the library exists and determines its server
  (CAS or SAS) before listing. Never calls sas-score-list-tables without first completing library verification.
---

# List Tables in a Library

**Trigger**: user says "list tables in \<lib\>", "show tables in \<lib\>", "what tables are in \<lib\>", etc.

> **Example prompt**: "list tables in Public"

**GATE**
Always follow the workflow steps in order. Do not skip the library and server verification step.

---

## Workflow
1. Use find-library-server skill to determine if library exists and which server it is on.
   - ✅ Found → call `sas-score-list-tables({ lib: <confirmed_lib>, server: <confirmed_server> })` with the confirmed values
    - ❌ Not found → **stop** and report not found to the user, offering to list available libraries if appropriate

---

## Pagination

For the first page pass `start=1` and `limit=10`. For subsequent pages compute `start = previous_start + limit`.
- If returned count equals `limit`: hint that more items are available and offer a next page.
- If returned count is less than `limit`: inform the user that all results have been returned.
