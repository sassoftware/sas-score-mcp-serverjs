/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function runJob(_appContext) {
 
  let description = `
run-job — execute a deployed SAS Viya job.

USE when: run job, execute job, run with parameters
DO NOT USE for: arbitrary SAS code (use run-sas-program), macros (use run-macro), list/find jobs

PARAMETERS
- name: string — job name (required)
- scenario: string | object — input parameters. Accepts: "x=1, y=2" or {x:1, y:2}

ROUTING RULES
- "run job xyz" → { name: "xyz" }
- "run job xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }

EXAMPLES
- "run job xyz" → { name: "xyz" }
- "run job monthly_etl with month=10, year=2025" → { name: "monthly_etl", scenario: {month:10, year:2025} }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use run-sas-program)
- "run macro X" (use run-macro)
- "list jobs" (use list-jobs)
- "find job X" (use find-job)

ERRORS
Returns log output, listings, tables from job. Error if job not found.
`;

  let spec = {
    name: 'run-job',
    description: description,
    inputSchema: z.object({
      name: z.string(),
      scenario: z.string().optional()
    }),
    handler: async (params) => {
      let scenario = params.scenario;
      let scenarioObj = {};
      let count = 0;
      // 
      if (scenario == null) {
        scenarioObj = {};
      } else if (typeof scenario === 'object') {
        scenarioObj = scenario;
      } else if (Array.isArray(scenario)) {
        scenarioObj = scenario[0];
      } else if (typeof scenario === 'string') {
        if (scenario.trim() === '') {
          scenarioObj = {};
        } else {
         // console.error('Incoming scenario', scenario);
          scenarioObj = scenario.split(',').reduce((acc, pair) => {
            let [key, value] = pair.split('=');
            acc[key.trim()] = value;
            count++;
            return acc;
          }, {});
        }
      }
      params.type = 'job';
      params.scenario = scenarioObj;
      // Provide runtime context for auth and server settings
      let r = await _jobSubmit(params);
      return r;
    }
  };
  return spec;
}

export default runJob;

