/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listMas from '../toolHelpers/_listMas.js';

function listMas(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
list-mas — list available MAS models.
PARAMS: intent ('list', required), start (number, default 1), limit (number, default 10)
RETURNS: array of MAS model names and metadata
` : `
list-mas — enumerate models published to MAS.

USE ONLY when: user explicitly asks to browse or enumerate models — "list models", "show all models", "list mas", "next page". Never use to verify if a specific model exists.
DO NOT USE for: verify or check if a specific model exists (use ${_appContext.brand}-find-mas or ${_appContext.brand}-find-model instead), find model, find mas, model metadata, score model, list jobs/tables/libraries

PARAMETERS
- intent: must be 'list' — only pass if user explicitly asked to list/enumerate MAS models. Do NOT use for read, find, or verify.
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
- "find model X" (use ${_appContext.brand}-find-mas)
- "does model churn_predictor exist" (use ${_appContext.brand}-find-mas)
- "is model X published to MAS" (use ${_appContext.brand}-find-mas)
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
      intent: z.literal('list'),
      limit: z.number().optional(),
      start: z.number().optional()
    }),
    handler: async (params) => {
      const { intent, ...rest } = params;
      let r = await _listMas(rest);
      return r;
    }
  }
  
  return spec;
}

export default listMas;

