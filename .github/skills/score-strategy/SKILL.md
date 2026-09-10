---
name: score-strategy
description: >
  Scoring router — classifies model type and delegates to the appropriate scoring skill.
  Use this as the entry point for any scoring request.
---

# Score Strategy (Router)

## Step 1 — Identify model type

Use the `a.b` notation rule from request-routing:

| Suffix `b` | Model type | Skill to use |
|---|---|---|
| `.mas` or *(no suffix — default)* | MAS | **score-mas-scr** |
| `.scr` | SCR | **score-mas-scr** |
| `.job` | Job | **score-job-jobdef** |
| `.jobdef` | JobDef | **score-job-jobdef** |
| `.sas` | SAS Program | **score-program** |
| `.casl` | CAS Program (inline src) | **score-cas** |
| CAS model table (`lib.table` form, no recognized suffix) + user says "cas model" | CAS Model | **score-cas** |
| Macro name (no `.` suffix) | Macro | **score-program** |

## Step 2 — Delegate

Load the appropriate skill and follow its workflow:

- **MAS / SCR** → `score-mas-scr` skill
- **Job / JobDef** → `score-job-jobdef` skill
- **SAS Program / Macro** → `score-program` skill
- **CAS Program / CAS Model** → `score-cas` skill

## Model Type from `a.b` Notation

Short form: if `b ∈ {mas, job, jobdef, scr, sas, casl}` → model type suffix; anything else → table reference.
Default (no suffix) → MAS.

> **CAS disambiguation:** if the user explicitly says "cas model" or "casmodel" with a `lib.table` reference (no `.casl` suffix), route to **score-cas** with `casmodel` param instead of the MAS default.
