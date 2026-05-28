/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobs from '../toolHelpers/_listJobs.js';
function jobDescribe(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
job-describe — return input schema for a Job model.
PARAMS: intent ('describe', required), name (string, required)
RETURNS: job input variable definitions
` : `
job-describe — return information about a specific SAS Viya job.

USE when: describe job, show job details, what does job X do, job metadata, inputs/outputs for job
DO NOT USE for: find job or verify it exists (use ${_appContext.brand}-find-job), list jobs (use ${_appContext.brand}-list-jobs), score job (use ${_appContext.brand}-job-score)

PARAMETERS
- intent: must be 'describe' — only pass if user explicitly asked to describe/inspect a job. Do NOT use for find or verify existence.
- name: string (required) — name of job whose details are being requested. Should be exact match to job name.

ROUTING RULES
- "describe job <name>" → { name: "<name>" }
- "describe model <name.job>"
- "info for job <name>" → { name: "<name>" }

EXAMPLES
- "describe job cars_job_v4" → { name: "cars_job_v4" }
- "describe metricsRefresh.job" → { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobs" (use ${_appContext.brand}-list-jobs)
- "score job cars_job_v4" (use ${_appContext.brand}-job-score)
- "score jobdef cars_job_v4" (use ${_appContext.brand}-jobdef-score)

ERRORS
Returns job metadata 
  `;

  let spec = {
    name: 'job-describe',
    description: description,
    inputSchema: z.object({
      intent: z.literal('describe'),
      name: z.string()
    }),
    handler: async (params) => {
      const { intent, ...rest } = params;
      if (rest.name != null && rest.name.endsWith('.job')) {
        rest.name = rest.name.slice(0, -4);
      }
      let r = await _listJobs(rest);
      return r;
    }
  }
    

  /* correct spec for registerTool with inputSchema */
  
  return spec;
}
export default jobDescribe;

