/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import debug from 'debug';
import _masDescribe from '../toolHelpers/_masDescribe.js';
const log = debug('tools');

function masDescribe(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
mas-describe — return input/output schema for a MAS model.
PARAMS: intent ('describe', required), name (string, required)
RETURNS: input variables, output variables, model type, description
` : `
mas-describe — return detailed information about a specific MAS model, including its inputs, outputs, and metadata.

USE when: what inputs does model need, describe model, show variables for model, model inputs/outputs
DO NOT USE for: find model, list models, score model, table/job operations

PARAMETERS
- intent: must be 'describe' — only pass if user explicitly asked to describe/inspect a MAS model. Do NOT use for find or verify existence.
- model: string — model name (required, exact match)

ROUTING RULES
- "what inputs does mas X need?" → { model: "X" }
- "describe mas Y" → { model: "Y" }
- "describe mas Y.mas" → { model: "Y" }
- "show variables for mas Z" → { model: "Z" }

EXAMPLES
- "What inputs does mas churnRisk need?" → { model: "churnRisk" }
- "Describe mas creditScore" → { model: "creditScore" }
- "Show variables for myModel" → { model: "myModel" }

NEGATIVE EXAMPLES (do not route here)
- "list mas" (use list-mas)
- "find mas X" (use find-mas)
- "score with mas X" (use model-score)

ERRORS
Returns model metadata: inputs (name, type, role), outputs (name, type, possible_values), model_type, description.
  `;

  let spec = {
    name: 'mas-describe',
    description: description,
    inputSchema: z.object({
      intent: z.literal('describe'),
      model: z.string()
    }),
    handler: async (params) => {
      const { intent, ...rest } = params;
      if (rest.model != null && rest.model.endsWith('.mas')) {
        rest.model = rest.model.slice(0, -4);
      }
      let r = await _masDescribe(rest);
      return r;
    }
  }
  return spec;
}

export default masDescribe;

