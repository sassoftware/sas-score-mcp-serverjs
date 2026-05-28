/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listMas from '../toolHelpers/_listMas.js';


function findMas(_appContext) {
  let description = `
find-mas — locate a specific model deployed to MAS (Model Aggregation Service).

USE when: find model, does model exist, is model deployed, lookup model, verify model exists
DO NOT USE for: list models (use list-mas), model info/variables (use mas-describe), score model (use mas-score), find table/job/lib (use respective tools), scr models (use scr-describe/scr-score)

PARAMETERS
- name: string (required) — model name to locate; if multiple supplied, use first

ROUTING RULES
- "find model <name>" → { name: "<name>" }
- "does model <name> exist" → { name: "<name>" }
- "is model <name> deployed" → { name: "<name>" }
- "lookup/verify model <name>" → { name: "<name>" }
- "find model" with no name → ask "Which model name would you like to find?"
- "find all models / list models" → use list-mas instead
- "score model <name>" → use mas-score instead
- "describe model / model info" → use mas-describe instead

EXAMPLES
- "find model myModel" → { name: "myModel" }
- "does model churn_score exist" → { name: "churn_score" }
- "is model riskModel deployed" → { name: "riskModel" }
- "lookup model claims_fraud_v1" → { name: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list models" (use list-mas)
- "score model myModel" (use mas-score)
- "model info for churnRisk" (use mas-describe)

ERRORS
Returns { models: [] } if not found; { models: [name, ...] } if found. Never hallucinate model names.
  `;

  let spec = {
    name: 'find-mas',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => {
      let r = await _listMas(params);
      return r;
    }
  }
  return spec;
}

export default findMas;


