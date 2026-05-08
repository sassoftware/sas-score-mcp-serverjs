# Score Skill Documentation

## Overview
The `score` skill is a generic scoring interface that automatically routes scoring requests to the appropriate tool based on the model type specified in the request.

## Syntax
```
score with model <name>.<type> [scenario =<key=value pairs>]
score <name>.<type> [scenario =<key=value pairs>]
```

## Supported Types
- **job** — Route to `run-job` for job-based scoring
- **jobdef** — Route to `run-jobdef` for job definition-based scoring
- **mas** — Route to `model-score` (Model Aggregation Service)
- **scr** — Route to `scr-score` (Score Code Runtime container)
- **sas** — Route to `run-sas-program` (arbitrary SAS/SQL scoring)

## Usage Examples

### MAS Model Scoring
```
score with model churn.mas where scenario =age=45,income=60000
score mymodel.mas using age=45, income=60000
```
Routes to: `model-score` with model name and scenario parameters

### Job-Based Scoring
```
score with model monthly_scorer.job scenario =month=10,year=2025
score mymodel.job with month=10, year=2025
```
Routes to: `run-job` with job name and parameters

### Job Definition Scoring
```
score fraud_detector.jobdef using amount=500,merchant=online
score predictions.jobdef where scenario =x=1,y=2
```
Routes to: `run-jobdef` with jobdef name and parameters

### SCR (Score Code Runtime) Scoring
```
score https://scr-host/models/loan.scr using age=45,credit_score=700
score mymodel.scr where scenario =age=45,income=60000
```
Routes to: `scr-score` with SCR URL and scenario

### SAS Program Scoring
```
score predictions.sas where scenario =x=1,y=2
score my_scoring_code.sas using month=10,year=2025
```
Routes to: `run-sas-program` with scenario parameters

## Parameter Details

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `model` | Yes | string | Model name with type suffix (e.g., `mymodel.mas`) |
| `scenario` | No | string\|object\|array | Input data as comma-separated key=value pairs |
| `type` | No | string | Type override (inferred from model name if not specified) |
| `prompt` | No | string | Full prompt for context |
| `context_data` | No | object | Contextual variables for fallback |

## Scenario Format
The scenario parameter accepts multiple formats:

**String format** (comma-separated):
```
age=45,income=60000,credit=700
```

**Object format**:
```javascript
{age: 45, income: 60000, credit: 700}
```

**Array format** (batch scoring):
```javascript
[
  {age: 45, income: 60000},
  {age: 50, income: 75000},
  {age: 35, income: 55000}
]
```

## Type Inference
The skill automatically infers the type from the model name:

```
mymodel.mas    → type = "mas"
scorer.job     → type = "job"
detector.jobdef → type = "jobdef"
risk.scr       → type = "scr"
predict.sas    → type = "sas"
```

If the type is not specified in the model name or as a parameter, the skill will ask for clarification:
```
"Is this a mas, scr, job, jobdef, or sas model?"
```

## Context-Based Scoring
If no scenario is provided, the skill can extract relevant variables from the conversation context:

1. Extracts available variables from context
2. Asks user for confirmation: *"I found these variables: [list]. Should I use them for scoring?"*
3. Proceeds with confirmed variables

## Return Values
The scoring response varies by type:

| Type | Returns |
|------|---------|
| **job** | Log output, tables created by job |
| **jobdef** | Log output, tables created by jobdef |
| **mas** | Predictions, probabilities, scores |
| **scr** | Predictions and metadata from SCR endpoint |
| **sas** | SAS execution output with results |

All responses include metadata indicating which tool was invoked.

## Error Handling

| Error | Message |
|-------|---------|
| Invalid type | "Unknown model type. Use: job, jobdef, mas, scr, or sas" |
| Missing model | "Please provide model name (e.g., score with model mymodel.mas)" |
| Invalid scenario | "Scenario must be key=value pairs separated by commas" |
| Routing failure | Backend error from invoked tool |

## Implementation Details

The skill is defined in `src/toolSet/scoreSkill.js` and:
- Parses model name to extract type
- Normalizes type names (e.g., `jobs` → `job`)
- Routes to appropriate tool handler
- Attaches scoring metadata to response
- Handles errors from backend tools

The skill is automatically registered in `makeTools.js` and available alongside other MCP tools.
