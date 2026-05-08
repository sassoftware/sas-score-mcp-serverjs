/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listModels from '../toolHelpers/_listModels.js';


function findModel(_appContext) {
  let description = `
find-model — locate a specific model deployed to MAS (Model Aggregation Service).

USE when: find model, does model exist, is model deployed, lookup model, verify model exists
DO NOT USE for: list models (use list-models), model info/variables (use model-info), score model (use model-score), find table/job/lib (use respective tools), scr models (use scr-info/scr-score)

PARAMETERS
- name: string (required) — model name to locate; if multiple supplied, use first

ROUTING RULES
- "find model <name>" → { name: "<name>" }
- "does model <name> exist" → { name: "<name>" }
- "is model <name> deployed" → { name: "<name>" }
- "lookup/verify model <name>" → { name: "<name>" }
- "find model" with no name → ask "Which model name would you like to find?"
- "find all models / list models" → use list-models instead
- "score model <name>" → use model-score instead
- "describe model / model info" → use model-info instead

EXAMPLES
- "find model myModel" → { name: "myModel" }
- "does model churn_score exist" → { name: "churn_score" }
- "is model riskModel deployed" → { name: "riskModel" }
- "lookup model claims_fraud_v1" → { name: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list models" (use list-models)
- "score model myModel" (use model-score)
- "model info for churnRisk" (use model-info)

ERRORS
Returns { models: [] } if not found; { models: [name, ...] } if found. Never hallucinate model names.
  `;

  let spec = {
    name: 'find-model',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => { 
      let r = await _listModels(params);
      return r;
    }
  }
  return spec;
}

export default findModel;

