/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function listJobdefs(_appContext) {

  let description = `
list-jobdefs — enumerate SAS Viya job definitions (jobdefs) assets.

USE when: list jobdefs, show jobdefs, browse jobdefs, list available jobdefs, next page
DO NOT USE for: find single jobdef (use ${_appContext.brand}-find-jobdef), execute jobdef (use ${_appContext.brand}-run-jobdef), find job (use ${_appContext.brand}-find-job), sas code (use ${_appContext.brand}-run-sas-program)

PARAMETERS
- limit: number (default: 10) — number of jobdefs per page
- start: number (default: 1) — 1-based page offset
- where: string (default: '') — optional filter expression

ROUTING RULES
- list jobdefs → { start: 1, limit: 10 }
- show me 25 jobdefs → { start: 1, limit: 25 }
- next jobdefs → { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- list jobdefs → { start: 1, limit: 10 }
- list 25 jobdefs → { start: 1, limit: 25 }
- next jobdefs → { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- find jobdef abc (use ${_appContext.brand}-find-jobdef)
- list jobs (use ${_appContext.brand}-list-jobs)
- run jobdef abc (use ${_appContext.brand}-run-jobdef)
- list models (use ${_appContext.brand}-list-models)

PAGINATION
If returned length === limit, hint: next start = start + limit. Empty result with start > 1 means paged past end.

ERRORS
Surface backend error directly; never fabricate jobdef names.
  `;

  let spec = {
    name: 'list-jobdefs',
    description: description,
    inputSchema: z.object({
      limit: z.number().optional(),
      start: z.number().optional(),
      where: z.string().optional()
    }),
  // No 'server' required; backend context is implicit in helper
    handler: async (params) => {
      // _listJobdefs handles all validation and defaults
      const result = await _listJobdefs(params);
      return result;
    }
  }
  return spec;
}
export default listJobdefs;

