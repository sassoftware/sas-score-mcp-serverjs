/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
import _findJob from '../toolHelpers/_findJob.js';
function findJob(_appContext) {
  
  let description = `
find-job — locate a specific SAS Viya job.

USE when: find job, does job exist, is there a job named, lookup job, verify job exists
DO NOT USE for: list jobs (use list-jobs), run job (use run-job), execute jobdef (use run-jobdef), find lib/table/model (use respective tools)

PARAMETERS
- name: string (required) — job name to locate; if multiple supplied, use first

ROUTING RULES
- "find job <name>" → { name: "<name>" }
- "does job <name> exist" → { name: "<name>" }
- "is there a job named <name>" → { name: "<name>" }
- "lookup/verify job <name>" → { name: "<name>" }
- "find job" with no name → ask "Which job name would you like to find?"
- "find all jobs / list jobs" → use list-jobs instead
- "run job <name>" → use run-job instead

EXAMPLES
- "find job cars_job_v4" → { name: "cars_job_v4" }
- "does job ETL exist" → { name: "ETL" }
- "is there a job named metricsRefresh" → { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobs" (use list-jobs)
- "run job cars_job_v4" (use run-job)
- "execute jobdef cars_job_v4" (use run-jobdef)

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
      let r = await _findJob(params);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default findJob;

