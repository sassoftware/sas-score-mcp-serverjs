---
name: request-routing
description: >
  Universal routing strategy for all SAS Viya requests. Every request follows the same three-step workflow.
---

# Universal Request Routing Strategy

All SAS Viya requests follow this three-step workflow:

## Step 1: Verify Resources Exist

Before executing any action, verify that the target resources exist.

| Resource Type | Find Tool | Notes |
|---|---|---|
| Library | `sas-score-find-library` | Specify server (cas or sas). For tables, determine server here. |
| Table | `sas-score-find-table` | Requires library name and server. |
| MAS Model | `sas-score-find-model` | No server selection. |
| Job | `sas-score-find-job` | No server selection. |
| JobDef | `sas-score-find-jobdef` | No server selection. |
| SCR Model | Skip verification | SCR models do not require pre-verification. |

**Rule**: Always verify before executing. Exception: SCR models can be scored directly.

---

## Step 2: Execute the Request

Once resources are verified to exist, select the appropriate execution tool:

| Request Type | Tool | Input |
|---|---|---|
| Read table rows | `sas-score-read-table` | lib, table, server (from Step 1) |
| Query table (aggregation) | `sas-score-sas-query` | lib.table, SQL query |
| Score with MAS model | `sas-score-mas-score` | model name, scenario data |
| Run Job | `sas-score-run-jobdef` | job name, scenario parameters |
| Run JobDef | `sas-score-run-jobdef` | jobdef name, scenario parameters |
| Score with SCR model | `sas-score-scr-score` | SCR URL, scenario data |

---

## Step 3: Merge Results

Combine verification and execution results:

- For **read/query**: Return rows as-is.
- For **scoring**: Merge predictions with input scenario data.
- For **jobs/jobdefs**: Return execution results (tables, logs).

---

## Special Case: Read + Score (Combined Workflow)

When the user requests scoring records from a table:

1. **Verify**: Find the table (determine server), find the model.
2. **Read**: Fetch rows from the table using `sas-score-read-table` or `sas-score-sas-query`.
3. **Map**: Check if table columns match model input variables. Ask user for mapping if needed.
4. **Score**: Score each row using `sas-score-mas-score` (for MAS) or `sas-score-scr-score` (for SCR).
5. **Merge**: Combine predictions with original rows.

---

## Error Handling

| Error | Action |
|---|---|
| Resource not found | Ask user to verify name and server (for tables). |
| Column/input mismatch | Ask user to map table columns to model inputs. |
| Empty result | Ask whether to adjust filter/criteria. |

---

## Examples

### Example 1: Read a table
**Request**: "read customers in Public"
1. Find library Public → Verified (CAS)
2. Read table customers in Public (CAS)
3. Return rows

### Example 2: Score with inline scenario
**Request**: "score a=1, b=2 with model simplejob.job"
1. Find job simplejob → Verified
2. Run simplejob with scenario {a: 1, b: 2}
3. Return result

### Example 3: Score records from table
**Request**: "score records from Public.customers with model risk_model.mas"
1. Find table customers in Public → Verified (CAS)
2. Find model risk_model → Verified (MAS)
3. Read rows from Public.customers
4. Score each row with risk_model
5. Return merged predictions + original data
