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
DO NOT USE for: list jobs (use ${_appContext.brand}-list-jobs), score job (use ${_appContext.brand}-score-job), score jobdef (use ${_appContext.brand}-score-jobdef), find lib/table/model (use respective tools)

PARAMETERS
- name: string (required) — job name to locate; if multiple supplied, use first

Naming Rules: 
- If user provides name with "job" suffix ".job", strip the suffix (e.g., "cars_job_v4.job"), and look for "cars_job_v4".

ROUTING RULES
- "find job <name>" → { name: "<name>" }
- "find name.job" → { name: "<name>" } 
- "does job <name> exist" → { name: "<name>" }
- "is there a job named <name>" → { name: "<name>" }
- "lookup/verify job <name>" → { name: "<name>" }
- "find job" with no name → ask "Which job name would you like to find?"
- "find all jobs / list jobs" → use ${_appContext.brand}-list-jobs instead
- "score job <name>" → use ${_appContext.brand}-score-job instead

EXAMPLES
- "find job cars_job_v4" → { name: "cars_job_v4" }
- "does job ETL exist" → { name: "ETL" }
- "is there a job named metricsRefresh" → { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobs" (use ${_appContext.brand}-list-jobs)
- "score job cars_job_v4" (use ${_appContext.brand}-score-job)
- "score jobdef cars_job_v4" (use ${_appContext.brand}-score-jobdef)

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
      if (params.name != null) {
        if (params.name.endsWith('.job'))   {
          params.name = params.name.slice(0, -4);
        }
      }
      let r = await _findJob(params);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default findJob;

