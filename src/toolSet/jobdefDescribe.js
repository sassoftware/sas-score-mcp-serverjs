/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function jobdefDescribe(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
jobdef-describe — return input schema for a JobDef model.
PARAMS: intent ('describe', required), name (string, required)
RETURNS: jobdef input variable definitions
` : `
jobdef-describe — return information about a specific SAS Viya jobdef.

USE when: describe jobdef, show jobdef details, what does jobdef X do, jobdef metadata, inputs/outputs for jobdef
DO NOT USE for: find jobdef or verify it exists (use ${_appContext.brand}-find-jobdef), list jobdefs (use ${_appContext.brand}-list-jobdefs), score jobdef (use ${_appContext.brand}-jobdef-score)

PARAMETERS
- intent: must be 'describe' — only pass if user explicitly asked to describe/inspect a jobdef. Do NOT use for find or verify existence.
- name: string (required) — name of jobdef whose details are being requested. Should be exact match to jobdef name.

ROUTING RULES
- "describe jobdef <name>" → { name: "<name>" }
- "describe <name.jobdef>"  
- "describe model <name.jobdef>"
- "info for jobdef <name>" → { name: "<name>" }

EXAMPLES
- "describe jobdef cars_job_v4" → { name: "cars_job_v4" }
- "describe metricsRefresh.jobdef" → { name: "metricsRefresh" }
- "info for jobdef ETL" → { name: "ETL" }

NEGATIVE EXAMPLES (do not route here)
- "list jobdefs" (use ${_appContext.brand}-list-jobdefs)
- "score jobdef cars_job_v4" (use ${_appContext.brand}-jobdef-score)
- "execute jobdef cars_job_v4" (use ${_appContext.brand}-jobdef-score)

ERRORS
Returns job metadata 
  `;

  let spec = {
    name: 'jobdef-describe',
    description: description,
    inputSchema: z.object({
      intent: z.literal('describe'),
      name: z.string()
    }),
    handler: async (params) => {
      const { intent, ...rest } = params;
      if (rest.name != null && rest.name.endsWith('.jobdef')) {
        rest.name = rest.name.slice(0, -7);
      }
      let r = await _listJobdefs(rest);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default jobdefDescribe;

