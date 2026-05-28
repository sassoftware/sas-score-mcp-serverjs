/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
function findJob(_appContext) {
  
  let description = `
find-job â€” locate a specific SAS Viya job.

USE when: find job, does job exist, is there a job named, lookup job, verify job exists
DO NOT USE for: list jobs (use list-jobs), run job (use job-score), execute jobdef (use jobdef-score), find lib/table/model (use respective tools)

PARAMETERS
- name: string (required) â€” job name to locate; if multiple supplied, use first

ROUTING RULES
- "find job <name>" â†’ { name: "<name>" }
- "does job <name> exist" â†’ { name: "<name>" }
- "is there a job named <name>" â†’ { name: "<name>" }
- "lookup/verify job <name>" â†’ { name: "<name>" }
- "find job" with no name â†’ ask "Which job name would you like to find?"
- "find all jobs / list jobs" â†’ use list-jobs instead
- "run job <name>" â†’ use job-score instead

EXAMPLES
- "find job cars_job_v4" â†’ { name: "cars_job_v4" }
- "does job ETL exist" â†’ { name: "ETL" }
- "is there a job named metricsRefresh" â†’ { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobs" (use list-jobs)
- "run job cars_job_v4" (use job-score)
- "execute jobdef cars_job_v4" (use jobdef-score)

ERRORS
Returns { jobs: [] } if not found; { jobs: [name, ...] } if found. Never hallucinate job names.
  `;

  let spec = {
    name: 'find-job',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => {
      let r = await _listJobs(params);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default findJob;


