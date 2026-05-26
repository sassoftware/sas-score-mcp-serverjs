/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
function listJobs(_appContext) {

  let description = `
list-jobs — enumerate SAS Viya job assets.

USE ONLY when: user explicitly asks to browse or enumerate jobs — "list jobs", "show all jobs", "browse jobs", "next page". Never use to verify if a specific job exists.
DO NOT USE for: verify or check if a specific job exists (use find-job instead), find single job (use find-job), execute job (use run-job), run job def (use run-jobdef), sas code (use run-sas-program)

PARAMETERS
- limit: number (default: 10) — number of jobs per page
- start: number (default: 1) — 1-based page offset
- where: string (default: '') — optional filter expression

ROUTING RULES
- list jobs → { start: 1, limit: 10 }
- show me 25 jobs → { start: 1, limit: 25 }
- next jobs → { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- list jobs → { start: 1, limit: 10 }
- list 25 jobs → { start: 1, limit: 25 }
- next jobs → { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- find job abc (use find-job)
- does job simplejob exist (use find-job)
- is job X available (use find-job)
- run job abc (use run-job)
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
      limit: z.number().int().min(1).optional(),
      start: z.number().int().min(1).optional(),
      where: z.string().min(1).optional()
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

