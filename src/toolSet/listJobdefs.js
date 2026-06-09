/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function listJobdefs(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
list-jobdefs — list available JobDef models.
PARAMS: intent ('list', required), start (number, default 1), limit (number, default 10)
RETURNS: array of jobdef names and metadata
` : `
list-jobdefs — enumerate SAS Viya job definitions (jobdefs) assets.

USE when: list jobdefs, show jobdefs, browse jobdefs, list available jobdefs, next page
DO NOT USE for: find single jobdef (use ${_appContext.brand}-find-jobdef), score jobdef (use ${_appContext.brand}-jobdef-score), find job (use ${_appContext.brand}-find-job), sas code (use ${_appContext.brand}-program-score)

PARAMETERS
- intent: must be 'list' — only pass if user explicitly asked to list/enumerate jobdefs. Do NOT use for find, verify, or execute.
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
- does jobdef X exist (use ${_appContext.brand}-find-jobdef)
- is jobdef X available (use ${_appContext.brand}-find-jobdef)
- list jobs (use ${_appContext.brand}-list-jobs)
- score jobdef abc (use ${_appContext.brand}-jobdef-score)
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

