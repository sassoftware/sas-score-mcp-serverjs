/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function jobScore(_appContext) {
  const isAgent = _appContext && _appContext.agent;

  let description = isAgent ? `
job-score — score by executing a SAS Viya Job model.
PARAMS: name (string, required), scenario (object, optional)
RETURNS: job log, ODS output, and any result tables
` : `
job-score — score with a deployed SAS Viya job model.

USE when: score with job, run job, execute job model
DO NOT USE for: arbitrary SAS code (use program-score), macros (use macro-score), list/find jobs

PARAMETERS
- name: string — job name (required)
- scenario: object — input parameters as JSON (optional, defaults to {}). Example: {month:10, year:2025}

ROUTING RULES
- "score with job xyz" → { name: "xyz" }
- "score with job xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }
- "run job xyz" → { name: "xyz" }
- "run job xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }

EXAMPLES
- "score with job xyz" → { name: "xyz" }
- "score with job monthly_etl with month=10, year=2025" → { name: "monthly_etl", scenario: {month:10, year:2025} }
- "score with monthly_etl.job with month=10, year=2025" → { name: "monthly_etl", scenario: {month:10, year:2025} }
- "run job xyz" → { name: "xyz" }
- "run job monthly_etl with month=10, year=2025" → { name: "monthly_etl", scenario: {month:10, year:2025} }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use program-score)
- "score macro X" (use macro-score)
- "list jobs" (use list-jobs)
- "find job X" (use find-job)

ERRORS
Returns log output, listings, tables from job. Error if job not found.
`;

  let spec = {
    name: 'job-score',
    description: description,
    inputSchema: z.object({
      name: z.string(),
      scenario: z.any()
    }),
    handler: async (params) => {
      let {scenario, name} = params;

      if(name.endsWith('.job')) {
        params.name = name.slice(0, -4);
      }
      // Convert the scenario string to an object
      // Example: "x=1, y=2, z=3" to { x: 1, y: 2, z: 3 }
      let scenarioObj = {};
      let count = 0;
      if (typeof scenario === 'object') {
        scenarioObj = scenario;
      } else if (Array.isArray(scenario)) {
        scenarioObj = scenario[0];
      } else {
        //console.error('Incoming scenario', scenario);
        scenarioObj = scenario.split(',').reduce((acc, pair) => {
          let [key, value] = pair.split('=');
          acc[key.trim()] = value;
          count++;
          return acc;
        }, {});
      }
      params.scenario = scenarioObj;
      params.type = 'job';
      // Provide runtime context for auth and server settings
      let r = await _jobSubmit(params);
      return r;
    }
  };
  return spec;
}

export default jobScore;

