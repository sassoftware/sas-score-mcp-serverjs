# GitHub Copilot — SAS Viya (concise agent guide)

This file is a short, agent-facing reference. It delegates routing and detailed decision logic to the canonical SKILLs in the `skills/` folder (especially `skills/request-routing/SKILL.md`). Keep this file minimal — use the SKILLs for examples and edge cases.

**Core principle (single sentence):** Verify resources, execute with the mapped tool, and format results.

## Canonical workflow
- Verify: confirm resources exist using `find-*` tools 
- Execute: call the execution tool mapped by the router (read/query/score/describe/list).
- Format: merge outputs, present results, and append a short Strategy Summary.

Note: the five-step phrasing (Identify → Verify → Select → Execute → Format) maps to the same implementation; prefer the three-step mental model when implementing.

## Agent defaults
- Default model type: MAS (unless user specifies `.job`, `.jobdef`, `.scr`, `.sas`, or `.casl`).
- Append a **Strategy Summary** to every response.
- Always determine table server (CAS vs SAS) during verification; ask if ambiguous.
- Do not invent resource names, servers, or model types — verify or ask.
- Pagination: always pass `start=1` and `limit=10` when calling any tool that accepts these parameters, unless the user specifies different values.

## Model types
All of the following are treated as **models** that can be scored:
- **MAS** (`.mas`) — Micro Analytic Score: `sas-score-mas-score`
- **SCR** (`.scr`) — Score Code Runtime: `sas-score-scr-score`
- **Job** (`.job`) — SAS Viya Job model: `sas-score-job-score`
- **JobDef** (`.jobdef`) — SAS Viya Job Definition model: `sas-score-jobdef-score`
- **Program** (`.sas`) — SAS Program model: `sas-score-program-score`
- **CAS Program** (`.casl`) — CASL Program model: `sas-score-cas-program-score`

## Canonical tool mappings (short)
- Find: `sas-score-find-library`, `sas-score-find-table`, `sas-score-find-mas`, `sas-score-find-job`, `sas-score-find-jobdef`
- Read / Query: `sas-score-read-table`, `sas-score-sas-query`
- Score models: `sas-score-mas-score`, `sas-score-scr-score`, `sas-score-job-score`, `sas-score-jobdef-score`, `sas-score-program-score`, `sas-score-cas-program-score`
- List: `sas-score-list-libraries`, `sas-score-list-tables`, `sas-score-list-mas`, `sas-score-list-jobs`, `sas-score-list-jobdefs`
- Detail: `sas-score-mas-describe`, `sas-score-job-describe`, `sas-score-jobdef-describe`, `sas-score-scr-describe`, `sas-score-table-describe`

## Strategy Summary (append to replies)
---
**Strategy Summary:**
- **Classification**: [Find / Read / Score / List / Describe]
- **Verification**: [Resources verified / skipped]
- **Tool(s)**: [Primary tool(s) invoked]
- **Decision**: [Server chosen, model type, mapping]
- **Next steps**: [Follow-ups or clarifications]

## When to ask a clarification (one focused question)
- Missing or ambiguous resource name
- Model type not specified (`.mas` / `.job` / `.jobdef` / `.scr` / `.sas` / `.casl`)
- Table library or server not specified
- Column-to-model-input mapping is unclear

## References
- Canonical router, examples, and Strategy Summary template: `skills/request-routing/SKILL.md`
- Find/verify resources: `skills/find-resources/SKILL.md`
- List/browse resources: `skills/list-resource/SKILL.md`
- Read/query data: `skills/read-strategy/SKILL.md`
- Scoring workflows: `skills/score-strategy/SKILL.md`
- Describe/detail resources: `skills/detail-strategy/SKILL.md`
- Decision trees (machine-readable): `decision-trees/`

Keep this file short. Use the SKILLs for decision trees, examples, and edge-case rules.
