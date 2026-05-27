# SAS MCP Server JS Agent — Prompt & Strategy Quick Reference

## Summary Table

| Common Prompt | Strategy Used |
|---|---|
| "score a=1, b=2 with model **X**" | **SCORE-STRATEGY** → Verify model (FIND-RESOURCE) → `mas-score` (inline scenario) |
| "run model **X** on table **T**" | **SCORE-STRATEGY** → Verify model + table (FIND-RESOURCE) → `read-table` rows → `mas-score` each row |
| "score all rows in  caslib **lib.Table** with **X**" | **SCORE-STRATEGY** → Verify model + CAS table → batch read → `mas-score` |
| "forecast with job **X**" | **SCORE-STRATEGY** → Verify job (FIND-RESOURCE) → `score-jobdef` |
| "score with SCR model **X**" | **SCORE-STRATEGY** → Skip verification → `scr-score` directly |
| "read table **Caslib.Table**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE, CAS) → `read-table` |
| "show first N records from **SASHELP.CLASS**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE, SAS) → `read-table` with `limit` |
| "fetch rows where status='active'" | **READ-STRATEGY** → Verify table (FIND-RESOURCE) → `read-table` with `where` filter |
| "how many **X** by **Y**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE) → `sas-query` (GROUP BY aggregate) |
| "count **X** grouped by **Y**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE) → `sas-query` (GROUP BY) |
| "average of **col** from **T**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE) → `sas-query` (AVG aggregate) |
| "query **T** where **condition**" | **READ-STRATEGY** → Verify table (FIND-RESOURCE) → `sas-query` (filtered SQL) |
