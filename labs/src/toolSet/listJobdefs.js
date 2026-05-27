/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function listJobdefs(_appContext) {

  let description = `
list-jobdefs â€” enumerate SAS Viya job definitions (jobdefs) assets.

USE when: list jobdefs, show jobdefs, browse jobdefs, list available jobdefs, next page
DO NOT USE for: find single jobdef (use find-jobdef), execute jobdef (use score-jobdef), find job (use find-job), sas code (use score-program)

PARAMETERS
- intent: must be 'list' — only pass if user explicitly asked to list/enumerate jobdefs. Do NOT use for find, verify, or execute.
- limit: number (default: 10) â€” number of jobdefs per page
- start: number (default: 1) â€” 1-based page offset
- where: string (default: '') â€” optional filter expression

ROUTING RULES
- list jobdefs â†’ { start: 1, limit: 10 }
- show me 25 jobdefs â†’ { start: 1, limit: 25 }
- next jobdefs â†’ { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- list jobdefs â†’ { start: 1, limit: 10 }
- list 25 jobdefs â†’ { start: 1, limit: 25 }
- next jobdefs â†’ { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- find jobdef abc (use find-jobdef)
- list jobs (use list-jobs)
- run jobdef abc (use score-jobdef)
- list models (use list-models)

PAGINATION
If returned length === limit, hint: next start = start + limit. Empty result with start > 1 means paged past end.

ERRORS
Surface backend error directly; never fabricate jobdef names.
  `;

  let spec = {
    name: 'list-jobdefs',
    description: description,
    inputSchema: z.object({
      intent: z.literal('list'),
      limit: z.number().optional(),
      start: z.number().optional(),
      where: z.string().optional()
    }),
  // No 'server' required; backend context is implicit in helper
    handler: async (params) => {
      // _listJobdefs handles all validation and defaults
      const { intent, ...rest } = params;
      const result = await _listJobdefs(rest);
      return result;
    }
  }
  return spec;
}
export default listJobdefs;


