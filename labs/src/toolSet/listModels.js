/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listModels from '../toolHelpers/_listModels.js';

function listModels(_appContext) {
  let description = `
list-models — enumerate models published to MAS.

USE ONLY when: user explicitly asks to browse or enumerate models — "list models", "show all models", "next page". Never use to verify if a specific model exists.
DO NOT USE for: verify or check if a specific model exists (use find-model instead), find model, model metadata, score model, list jobs/tables/libraries

PARAMETERS
- limit: number (default: 10) — page size
- start: number (default: 1) — 1-based offset

ROUTING RULES
- "list models" → { start:1, limit:10 }
- "list 25 models" → { start:1, limit:25 }
- "next models" → { start: start+limit, limit:10 }

EXAMPLES
- "list models" → { start:1, limit:10 }
- "list 25 models" → { start:1, limit:25 }

NEGATIVE EXAMPLES (do not route here)
- "find model X" (use find-model)
- "does model churn_predictor exist" (use find-model)
- "is model X published to MAS" (use find-model)
- "describe model X" (use model-info)
- "score model X" (use model-score)
- "list jobs" (use list-jobs)

ERRORS
Returns empty array if no models found.
  `;

  let spec = {
    name: 'list-models',
    description: description,
    inputSchema: z.object({
      limit: z.number().int().min(1).optional(),
      start: z.number().int().min(1).optional()
    }),
    handler: async (params) => { 
      let r  = await _listModels(params);
      return r;
    }
  }
  
  return spec;
}

export default listModels;

