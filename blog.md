# SAS MCP Server JS Agent — Prompt & Strategy Quick Reference

## Summary Table

| Common Prompt | Strategy Used |
|---|---|
| "score a=1, b=2 with model **X**" | **SAS-SCORE-SCORE-STRATEGY** → Verify model (SAS-SCORE-FIND-RESOURCES) → `mas-score` (inline scenario) |
| "run model **X** on table **T**" | **SAS-SCORE-SCORE-STRATEGY** → Verify model + table (SAS-SCORE-FIND-RESOURCES) → `read-table` rows → `mas-score` each row |
| "score all rows in  caslib **lib.Table** with **X**" | **SAS-SCORE-SCORE-STRATEGY** → Verify model + CAS table → batch read → `mas-score` |
| "forecast with job **X**" | **SAS-SCORE-SCORE-STRATEGY** → Verify job (SAS-SCORE-FIND-RESOURCES) → `jobdef-score` |
| "score with SCR model **X**" | **SAS-SCORE-SCORE-STRATEGY** → Skip verification → `scr-score` directly |
| "read table **Caslib.Table**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES, CAS) → `read-table` |
| "show first N records from **SASHELP.CLASS**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES, SAS) → `read-table` with `limit` |
| "fetch rows where status='active'" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES) → `read-table` with `where` filter |
| "how many **X** by **Y**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES) → `sas-query` (GROUP BY aggregate) |
| "count **X** grouped by **Y**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES) → `sas-query` (GROUP BY) |
| "average of **col** from **T**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES) → `sas-query` (AVG aggregate) |
| "query **T** where **condition**" | **SAS-SCORE-READ-STRATEGY** → Verify table (SAS-SCORE-FIND-RESOURCES) → `sas-query` (filtered SQL) |
