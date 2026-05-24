/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function jobdefInfo(_appContext) {
  
  let description = `
jobdef    -info — return information about a specific SAS Viya jobdef.

USE when: find jobdef, does jobdef exist, is there a jobdef named, lookup jobdef, verify jobdef exists
DO NOT USE for: list jobdefs (use ${_appContext.brand}-list-jobdefs), run jobdef (use ${_appContext.brand}-run-jobdef), find lib/table/model (use respective tools)

PARAMETERS
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
- "run jobdef cars_job_v4" (use ${_appContext.brand}-run-jobdef)
- "execute jobdef cars_job_v4" (use ${_appContext.brand}-run-jobdef)

ERRORS
Returns job metadata 
  `;

  let spec = {
    name: 'jobdef-info',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => {
      if (params.name != null) {
        if (params.name.endsWith('.jobdef'))   {
          params.name = params.name.slice(0, -7);
        }
      }
      // _listJobs can handle job lookup by name and will return an appropriate error message if not found, so we can rely on that for error handling here.
      let r = await _listJobdefs(params);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default jobdefInfo;

