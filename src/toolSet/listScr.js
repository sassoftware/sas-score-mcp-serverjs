/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listScr from '../toolHelpers/_listScr.js';

function listScr(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
list-scr — list available SCR models.
PARAMS: start (number, default 1), limit (number, default 10)
RETURNS: array of SCR model names and metadata
` : `
list-scr â€” enumerate models published to scr.

USE when:  list scr, show scr next page
DO NOT USE for: ${_appContext.brand}-find model, ${_appContext.brand}-find scr, ${_appContext.brand}-model metadata, ${_appContext.brand}-score model, ${_appContext.brand}-list jobs/tables/libraries

PARAMETERS
- limit: number (default: 10) â€” page size
- start: number (default: 1) â€” 1-based offset

ROUTING RULES
- "list scr" â†’ { start:1, limit:10 }
- "list 25 scr" â†’ { start:1, limit:25 }
- "next scr" â†’ { start: start+limit, limit:10 }

EXAMPLES
- "list scr" â†’ { start:1, limit:10 }
- "list 25 scr" â†’ { start:1, limit:25 }

NEGATIVE EXAMPLES (do not route here)
- "find scr X" (use ${_appContext.brand}-find-scr)
- "describe scr X" (use ${_appContext.brand}-scr-describe)
- "score scr X" (use ${_appContext.brand}-scr-score)
- "list jobs" (use ${_appContext.brand}-list-jobs)

ERRORS
Returns empty array if no scrs found.
  `;

  let spec = {
    name: 'list-scr',
    description: description,
    inputSchema: z.object({
      limit: z.number().optional(),
      start: z.number().optional()
    }),
    handler: async (params) => { 
      const { intent, ...rest } = params;
      rest.start = rest.start ?? 1;
      rest.limit = rest.limit ?? 10;
      let r  = await _listScr(rest);
      return r;
    }
  }
  
  return spec;
}

export default listScr;


