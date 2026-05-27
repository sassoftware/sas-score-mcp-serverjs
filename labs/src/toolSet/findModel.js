/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listModels from '../toolHelpers/_listModels.js';


function findModel(_appContext) {
  let description = `
find-model â€” locate a specific model deployed to MAS (Model Aggregation Service).

USE when: find model, does model exist, is model deployed, lookup model, verify model exists
DO NOT USE for: list models (use list-models), model info/variables (use model-info), score model (use model-score), find table/job/lib (use respective tools), scr models (use scr-describe/scr-score)

PARAMETERS
- name: string (required) â€” model name to locate; if multiple supplied, use first

ROUTING RULES
- "find model <name>" â†’ { name: "<name>" }
- "does model <name> exist" â†’ { name: "<name>" }
- "is model <name> deployed" â†’ { name: "<name>" }
- "lookup/verify model <name>" â†’ { name: "<name>" }
- "find model" with no name â†’ ask "Which model name would you like to find?"
- "find all models / list models" â†’ use list-models instead
- "score model <name>" â†’ use model-score instead
- "describe model / model info" â†’ use model-info instead

EXAMPLES
- "find model myModel" â†’ { name: "myModel" }
- "does model churn_score exist" â†’ { name: "churn_score" }
- "is model riskModel deployed" â†’ { name: "riskModel" }
- "lookup model claims_fraud_v1" â†’ { name: "claims_fraud_v1" }

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


