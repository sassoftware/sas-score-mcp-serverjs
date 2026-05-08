/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listModels from '../toolHelpers/_listModels.js';

function listModels(_appContext) {
  let description = `
list-models — enumerate models published to MAS.

USE when: list models, show models, browse models, next page
DO NOT USE for: find model, model metadata, score model, list jobs/tables/libraries

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
      limit: z.number().optional(),
      start: z.number().optional()
    }),
    handler: async (params) => { 
      let r  = await _listModels(params);
      return r;
    }
  }
  
  return spec;
}

export default listModels;

