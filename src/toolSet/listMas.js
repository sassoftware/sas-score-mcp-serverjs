/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listMas from '../toolHelpers/_listMas.js';

function listMas(_appContext) {
  let description = `
list-mas — enumerate models published to MAS.

USE when: list models, show models, list mas, show mas next page
DO NOT USE for: find model, find mas, model metadata, score model, list jobs/tables/libraries

PARAMETERS
- limit: number (default: 10) — page size
- start: number (default: 1) — 1-based offset

ROUTING RULES
- "list models" → { start:1, limit:10 }
- "list 25 models" → { start:1, limit:25 }
- "next models" → { start: start+limit, limit:10 }
- "list mas" → { start:1, limit:10 }
- "list 25 mas" → { start:1, limit:25 }
- "next mas" → { start: start+limit, limit:10 }

EXAMPLES
- "list models" → { start:1, limit:10 }
- "list 25 models" → { start:1, limit:25 }
- "list mas" → { start:1, limit:10 }
- "list 25 mas" → { start:1, limit:25 }

NEGATIVE EXAMPLES (do not route here)
- "find model X" (use ${_appContext.brand}-find-model)
- "describe model X" (use ${_appContext.brand}-model-info)
- "score model X" (use ${_appContext.brand}-model-score)
- "list jobs" (use ${_appContext.brand}-list-jobs)

ERRORS
Returns empty array if no models found.
  `;

  let spec = {
    name: 'list-mas',
    description: description,
    inputSchema: z.object({
      limit: z.number().optional(),
      start: z.number().optional()
    }),
    handler: async (params) => { 
      let r  = await _listMas(params);
      return r;
    }
  }
  
  return spec;
}

export default listMas;

