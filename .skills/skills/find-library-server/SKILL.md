---
name: find-library-server
description: >
  Verify that a SAS Viya library exists and determine which server (CAS or SAS) hosts it.
  Always checks CAS first, then SAS. Returns the confirmed library name and server.
  Use whenever you need to confirm a library exists before listing tables or performing any library-scoped operation.
---

# Find Library Server

**Purpose**: Verify a library exists and determine whether it lives in CAS or SAS.

**Tool**: `sas-score-find-library({ name, server })`

---

## Workflow

1. Call `sas-score-find-library({ name: "<lib>", server: "cas" })`
   - ✅ Found → return `{ lib: "<lib>", server: "cas" }`
   - ❌ Not found → go to step 2

2. Call `sas-score-find-library({ name: "<LIB_UPPERCASED>", server: "sas" })`
   - ✅ Found → return `{ lib: "<LIB_UPPERCASED>", server: "sas" }`
   - ❌ Not found → library does not exist; **stop** and report not found to the user

---

## Known Library Hints (skip searching if known)

Use these to skip the two-step search when the server is already deterministic:

| Library (case-insensitive) | Server |
|---|---|
| Casuser, Formats, ModelPerformanceData, Models, Public, Samples, SystemData | `"cas"` (check CAS only) |
| MAPS, MAPSGFK, MAPSSAS, SASDQREF, SASHELP, SASUSER, WORK | `"sas"` (check SAS only, uppercase lib) |
| Unknown | Try CAS first; if not found, try SAS with uppercased lib |

---

## Output

Always return the confirmed resolved values to the caller:

| Field | Value |
|---|---|
| `lib` | Confirmed library name (may be uppercased for SAS) |
| `server` | `"cas"` or `"sas"` |

---

## Error Handling

- Not found in either server → confirm spelling with the user and offer to list available libraries.
- Do **not** fall back to listing libraries as a substitute for verification — they serve different purposes.

---

## Important Constraints

- **Never use `list-*` tools for library verification** — use only `sas-score-find-library`.
- This skill verifies libraries only. To verify a table, use `sas-score-find-table` directly (it validates the library implicitly).
