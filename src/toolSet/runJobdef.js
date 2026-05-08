/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function runJobdef(_appContext) {
  // JSON object for LLM/tooling
 
  let description = `
run-jobdef — score with a deployed SAS Viya job definition.

USE when: score with jobdef, run jobdef, execute jobdef
DO NOT USE for: arbitrary SAS code (use run-sas-program), macros (use run-macro), list/find jobdefs

PARAMETERS
- name: string — jobdef name (required)
- scenario: object — input parameters as JSON (optional, defaults to {}). Example: {month:10, year:2025}

ROUTING RULES
- "run jobdef xyz" → { name: "xyz" }
- "run jobdef xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }

EXAMPLES
- "run jobdef xyz" → { name: "xyz" }
- "run jobdef monthly_report with month=10, year=2025" → { name: "monthly_report", scenario: {month:10, year:2025} }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use run-sas-program)
- "run macro X" (use run-macro)
- "list jobdefs" (use list-jobdefs)
- "find jobdef X" (use find-jobdef)

ERRORS
Returns log output, listings, tables from jobdef. Error if jobdef not found.
  `;
 
  let spec = {
    name: 'run-jobdef',
    description: description,
    inputSchema: z.object({
      name: z.string(),
      scenario: z.any()
    }),
    handler: async (params) => {
      let scenario = params.scenario;

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
      params.type = 'def';
      // Provide runtime context for auth and server settings
      let r = await _jobSubmit(params);
      return r;
    }
  };
  return spec;
}

export default runJobdef;

