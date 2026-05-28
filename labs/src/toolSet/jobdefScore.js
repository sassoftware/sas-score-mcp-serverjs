/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function jobdefScore(_appContext) {

  let description = `
jobdef-score — execute a SAS Viya job definition.

USE when: run jobdef, execute jobdef, run with parameters
DO NOT USE for: arbitrary SAS code (use program-score), macros (use macro-score), list/find jobdefs

PARAMETERS
- name: string — jobdef name (required)
- scenario: string | object — input parameters. Accepts: "x=1, y=2" or {x:1, y:2}

ROUTING RULES
- "run jobdef xyz" → { name: "xyz" }
- "run jobdef xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }

EXAMPLES
- "run jobdef xyz" → { name: "xyz" }
- "run jobdef monthly_report with month=10, year=2025" → { name: "monthly_report", scenario: {month:10, year:2025} }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use program-score)
- "run macro X" (use macro-score)
- "list jobdefs" (use list-jobdefs)
- "find jobdef X" (use find-jobdef)

ERRORS
Returns log output, listings, tables from jobdef. Error if jobdef not found.
  `;

  let spec = {
    name: 'jobdef-score',
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
      params.type = 'def';
      params.scenario = scenarioObj;
      // Provide runtime context for auth and server settings
      let r = await _jobSubmit(params);
      return r;
    }
  };
  return spec;
}

export default jobdefScore;
