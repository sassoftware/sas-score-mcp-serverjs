/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';


function runJobdef(_appContext) {
  // JSON object for LLM/tooling
 
  let description = `
## run-jobdef — execute a SAS Viya job definition

LLM Invocation Guidance (When to use)
Use THIS tool when:
- You want to run a registered Job Definition by name
- You can pass parameters to the job definition

Do NOT use this tool for:
- Running arbitrary SAS code (use run-program tool)
- Invoking SAS macros (use run-macro tool)
- Listing or finding jobdefs (use list-jobdefs tool / find-jobdef tool)

Parameters
- name (string, required): The job definition name to execute
- scenario (string | object, optional): Input values. Accepts:
  - a comma-separated key=value string (e.g. "x=1, y=2")
  - a JSON object with field names and values (recommended)

Response
- Log output, listings, and tables depending on the job definition's design. Table outputs will be displayed when present.

Examples (→ mapped params)
- "jobdef xyz param1=10,param2=val2" → { name: "xyz", scenario: { param1: 10, param2: "val2" } }
- "run jobdef name=monthly_report, scenario=month=10,year=2025" → { name: "monthly_report", scenario: { month: 10, year: 2025 } }
- "run-jobdef xyz param1=10,param2=val2" → { name: "xyz", scenario: { param1: 10, param2: "val2" } }
- "jobdef name=monthly_report, scenario=month=10,year=2025" → { name: "monthly_report", scenario: { month: 10, year: 2025 } 
`;
 
  let spec = {
      name: 'run-jobdef',
      aliases: ['jobDef','jobdef','jobdef'],
    description: description,
    schema: {
      name: z.string(),
      scenario: z.any().default(''),
    },
    required: ['name'],
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

export default runJobdef;
