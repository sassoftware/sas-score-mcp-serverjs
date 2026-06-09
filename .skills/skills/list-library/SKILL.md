---
name: list-library
description: >
  List SAS Viya libraries. Calls sas-score-list-libraries with the appropriate server parameter.
  Use only when the user explicitly wants to browse or enumerate libraries, not to verify a specific library exists.
  User must specify server (CAS or SAS) in their request to trigger this skill; 
---

# List Libraries

**Trigger**: 
- "list libraries in cas",
-  "show all libraries in cas", 
- "list libraries in sas",
-  "enumerate libraries in sas",
-  "what libraries are available in cas", 
- "what libraries are available in sas".

**GATE**

Do not use this skill when the request is to verify whether a specific resource exists — use find-resources skill for that.

**Tool**
Use `sas-score-list-libraries` tool with the appropriate server parameter based on user input. -> sas-score-list-libraries({ server: "cas" }) or sas-score-list-libraries({ server: "sas" })  

## Pagination

For the first page pass `start=1` and `limit=10`. For subsequent pages compute `start = previous_start + limit`.
- If returned count equals `limit`: hint that more items are available and offer a next page.
- If returned count is less than `limit`: inform the user that all results have been returned.
