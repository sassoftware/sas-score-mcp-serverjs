/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import debug from 'debug';
import _masDescribe from '../toolHelpers/_masDescribe.js';
const log = debug('tools');

function modelInfo(_appContext) {
  let description = `
model-info — return detailed information about a specific MAS model, including its inputs, outputs, and metadata.

USE when: what inputs does model need, describe model, show variables for model, model inputs/outputs
DO NOT USE for: find model, list models, score model, table/job operations

PARAMETERS
- model: string — model name (required, exact match)

ROUTING RULES
- "what inputs does model X need?" → { model: "X" }
- "describe model Y" → { model: "Y" }
- "show variables for Z" → { model: "Z" }

EXAMPLES
- "What inputs does model churnRisk need?" → { model: "churnRisk" }
- "Describe model creditScore" → { model: "creditScore" }
- "Show variables for myModel" → { model: "myModel" }

NEGATIVE EXAMPLES (do not route here)
- "list models" (use list-models)
- "find model X" (use find-model)
- "score with model X" (use model-score)

ERRORS
Returns model metadata: inputs (name, type, role), outputs (name, type, possible_values), model_type, description.
  `;

  let spec = {
    name: 'model-info',
    description: description,
    inputSchema: z.object({
      model: z.string()
    }),
    handler: async (params) => {
      let r = await _masDescribe(params);
      return r;
    }
  }
  return spec;
}

export default modelInfo;

