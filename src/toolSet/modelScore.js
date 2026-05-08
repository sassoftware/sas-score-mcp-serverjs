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
mas-score — score data using a deployed model on MAS.

USE when: score with model, predict using model, batch scoring, model predictions
DO NOT USE for: find model, model metadata, list models, run programs/jobs, query tables

PARAMETERS
- model: string — model name (required, exact match)
- scenario: object — input data as JSON (optional, defaults to {}). Example: {age:45, income:60000}


ROUTING RULES
- "score with model X using a=1, b=2" → { model: "X", scenario: {a:1, b:2} }
- "predict using model Y with age=45, income=60000" → { model: "Y", scenario: {age:45, income:60000} }

EXAMPLES
- "score with model churn using age=45, income=60000" → { model: "churn", scenario: {age:45, income:60000} }
- "predict creditScore for credit=700, debt=20000" → { model: "creditScore", scenario: {credit:700, debt:20000} }

NEGATIVE EXAMPLES (do not route here)
- "find model X" (use find-model)
- "what inputs does model need" (use model-info)
- "list models" (use list-models)
- "run job X" (use run-job)

ERRORS
Returns predictions, probabilities, scores merged with input data. Returns error if model not found or scoring fails.
  `;

 
  let spec = {
    name: 'mas-score',
    description: description,
    inputSchema: z.object({
      model: z.string(),
      scenario: z.any()
    }),
      
    handler: async (iparams) => {
      let params = {...iparams};
      let scenario = params.scenario;

      // Convert the scenario string to an object
      // Example: "x=1, y=2, z=3" to { x: 1, y: 2, z: 3 }
      let scenarioObj = {};
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
      params.scenario = scenarioObj;
      // Drop model extension (e.g., .job, .model)
      if (params.model && params.model.includes('.')) {
        params.model = params.model.substring(0, params.model.lastIndexOf('.'));
      }
  
      log('modelScore params', params);
      // Check if the params.scenario is a string and parse it
      let r = await _masScoring(params)
      return r;
    }
  }
  return spec;
}

export default modelScore;

