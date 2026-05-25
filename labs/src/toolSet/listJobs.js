/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
function listJobs(_appContext) {

  let description = `
list-jobs â€” enumerate SAS Viya job assets.

USE when: list jobs, show jobs, browse jobs, list available jobs, next page
DO NOT USE for: find single job (use find-job), execute job (use score-job), run job def (use score-jobdef), sas code (use score-program)

PARAMETERS
- limit: number (default: 10) â€” number of jobs per page
- start: number (default: 1) â€” 1-based page offset
- where: string (default: '') â€” optional filter expression

ROUTING RULES
- list jobs â†’ { start: 1, limit: 10 }
- show me 25 jobs â†’ { start: 1, limit: 25 }
- next jobs â†’ { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- list jobs â†’ { start: 1, limit: 10 }
- list 25 jobs â†’ { start: 1, limit: 25 }
- next jobs â†’ { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- find job abc (use find-job)
- run job abc (use score-job)
- list models (use list-models)
- list tables in lib xyz (use list-tables)

PAGINATION
If returned length === limit, hint: next start = start + limit. Empty result with start > 1 means paged past end.

ERRORS
Surface backend error directly; never fabricate job names.
  `;

  let spec = {
    name: 'list-jobs',
    description: description,
    inputSchema: z.object({
      limit: z.number().optional(),
      start: z.number().optional(),
      where: z.string().optional()
    }),
  // No 'server' required; backend context is implicit in helper
    handler: async (params) => {
      // _listJob handles all validation and defaults
      const result = await _listJobs(params);
      return result;
    }
  }
  return spec;
}
export default listJobs;


