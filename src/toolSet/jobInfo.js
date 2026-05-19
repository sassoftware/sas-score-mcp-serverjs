/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
function jobInfo(_appContext) {
  
  let description = `
job-info — return information about a specific SAS Viya job.

USE when: find job, does job exist, is there a job named, lookup job, verify job exists
DO NOT USE for: list jobs (use list-jobs), run job (use run-job), execute jobdef (use run-jobdef), find lib/table/model (use respective tools)

PARAMETERS
- name: string (required) — name of job whose details are being requested. Should be exact match to job name.

ROUTING RULES
- "describe job <name>" → { name: "<name>" }
- "describe model <name.job>"
- "info for job <name>" → { name: "<name>" }

EXAMPLES
- "describe job cars_job_v4" → { name: "cars_job_v4" }

NEGATIVE EXAMPLES (do not route here)
- "list jobs" (use list-jobs)
- "run job cars_job_v4" (use run-job)
- "execute jobdef cars_job_v4" (use run-jobdef)

ERRORS
Returns job metadata 
  `;

  let spec = {
    name: 'job-info',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => {
      if (params.name != null) {
        if (params.name.endsWith('.job'))   {
          params.name = params.name.slice(0, -4);
        }
      }
      // _listJobs can handle job lookup by name and will return an appropriate error message if not found, so we can rely on that for error handling here.
      let r = await _listJobs(params);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default jobInfo;

