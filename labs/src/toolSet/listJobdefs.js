/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function listJobdefs(_appContext) {

  let description = `
list-jobdefs — enumerate SAS Viya job definitions (jobdefs) assets.

USE ONLY when: user explicitly asks to browse or enumerate jobdefs — "list jobdefs", "show all jobdefs", "browse jobdefs", "next page". Never use to verify if a specific jobdef exists.
DO NOT USE for: verify or check if a specific jobdef exists (use find-jobdef instead), find single jobdef (use find-jobdef), execute jobdef (use run-jobdef), find job (use find-job), sas code (use run-sas-program)

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
- find jobdef abc (use find-jobdef)
- does jobdef X exist (use find-jobdef)
- is jobdef X available (use find-jobdef)
- list jobs (use list-jobs)
- run jobdef abc (use run-jobdef)
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

