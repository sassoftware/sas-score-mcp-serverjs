/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import debug from 'debug';
import _masScoring from '../toolHelpers/_masScoring.js';
const log = debug('tools');

function modelScore(_appContext) {
  let description = `
## model-score — score data using a deployed model on MAS

LLM Invocation Guidance (When to use)
Use THIS tool when:
- User wants to score data with a model: "score this customer with model churnRisk"
- User provides input values for prediction: "predict using model creditScore with age=45, income=60000"
- User wants batch scoring: "score these 10 customers with fraud model"
- User asks for model predictions: "what does the sales forecast model predict for Q4?"
- User wants to get predictions: "use the risk model to score this applicant"
- User provides scenario data for a model: "run model cancer1 with age=45, sex=M"

Do NOT use this tool for:
- Checking if a model exists (use find-model)
- Getting model metadata/variables (use model-info)
- Listing available models (use list-models)
- Running SAS programs (use run-sas-program)
- Running jobs (use run-job)
- Querying tables (use sas-query or read-table)

Purpose
Score user-supplied scenario data using a model published to MAS (Model Aggregation Service) on SAS Viya. Returns predictions, probabilities, scores, and other model outputs merged with the input data.

Parameters
- model (string, required): The name of the model as published to MAS. Must be exact match.
- scenario (string | object | array, required): Data to score. Accepts:
  - A comma-separated key=value string (e.g., "x=1, y=2")
  - A plain object with field names and values (e.g., {x: 1, y: 2})
  - An array of objects for batch scoring
- uflag (boolean, default false): When true, returned model field names will be prefixed with an underscore.

Parsing & Behavior
- If scenario is a string, the tool parses comma-separated key=value pairs into an object
- If scenario is an array, supports batch scoring (processes multiple records)
- Numeric values in strings remain as strings; validate and cast as needed before scoring

Response Contract
Returns a JSON object containing:
- Input fields merged with scoring results
- Prediction/score field(s) from the model (field names depend on model)
- Probability fields for classification models (e.g., P_class1, P_class2)
- Model metadata: model name, version if available
- _variables_: Variable metadata if uflag=true
- Error object if scoring fails with error message

Disambiguation & Clarification
- Missing model name: ask "Which model would you like to use for scoring?"
- Missing scenario data: ask "What input values should I use for scoring?"
- If model unknown: suggest "Use find-model to verify the model exists or list-models to see available models"
- If unsure of inputs: suggest "Use model-info to see the required input variables first"

Examples (→ mapped params)
- "score with model churn using age=45, income=60000" → { model: "churn", scenario: { age: "45", income: "60000" }, uflag: false }
- "predict creditScore for applicant: credit=700, debt=20000" → { model: "creditScore", scenario: { credit: "700", debt: "20000" }, uflag: false }
- "use fraud model to score transaction amount=500, merchant=online" → { model: "fraud", scenario: { amount: "500", merchant: "online" }, uflag: false }
- "run model cancer1 with age=45, sex=M, tumor=stage2" → { model: "cancer1", scenario: { age: "45", sex: "M", tumor: "stage2" }, uflag: false }

Negative Examples (should NOT call model-score)
- "find model churnRisk" (use find-model instead)
- "what inputs does model need?" (use model-info instead)
- "list all models" (use list-models instead)
- "run job scoring_job" (use run-job instead)
- "read table scores from Public" (use read-table instead)

Usage Tips
- Use model-info first to understand required input variables and data types
- Verify model exists with find-model before attempting to score
- For batch scoring, provide an array of objects as the scenario parameter
- Ensure MAS connectivity and credentials are available

Related Tools
- list-models → find-model → model-info → model-score (typical workflow)
- find-model — to verify model exists before scoring
- model-info — to understand required inputs and expected outputs
- list-models — to discover available models
`;

 
  let spec = {
    name: 'model-score',
    aliases: ['modelScore','model score','model_score'],
    description: description,
    schema: {
      'model': z.string(),
      'scenario': z.any(),
      'uflag': z.boolean()
    },
    required: ['model', 'scenario'],
    handler: async (iparams) => {
      let params = {...iparams}; 
      let scenario = params.scenario;
   
        // Convert the scenario string to an object
        // Example: "x=1, y=2, z=3" to { x: 1, y: 2, z: 3 }
      let scenarioObj ={};
       let count = 0;
      if (typeof scenario === 'object') {
        scenarioObj = scenario;
      } else if (Array.isArray(scenario)) { 
        scenarioObj = scenario[0];
      } else {
        //console.error('Incoming scenario', scenario);
        scenarioObj = scenario.split(',').reduce((acc, pair) => {
            let [key, value] = pair.split('=');
            acc[key.trim()] = value;
            count++;
            return acc;
          }, {});
        }
      params.scenario= scenarioObj;
      log('modelScore params', params);
      // Check if the params.scenario is a string and parse it
      let r = await _masScoring(params)
      return r;
    }
  }
  return spec;
}

export default modelScore;
