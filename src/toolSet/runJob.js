/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function runJob(_appContext) {
 
  let description = `
## run-job — execute a deployed SAS Viya job

LLM Invocation Guidance (When to use)
Use THIS tool when:
- You want to run a registered Job Execution asset by name
- You have simple parameter inputs to pass to the job

Do NOT use this tool for:
- Running arbitrary SAS code (use run-sas-program)
- Invoking pre-defined SAS macros (use run-macro)
- Listing or finding jobs (use list-jobs / find-job)

Parameters
- name (string, required): The job name to execute
- scenario (string | object, optional): Input values to the job. Accepts:
  - a comma-separated key=value string (e.g. "x=1, y=2")
  - a JSON object with field names and values (recommended)

Response
- Log output, listings, and tables depending on the job’s design. Table outputs will be displayed when present.

Examples (→ mapped params)
- "run job xyz param1=10,param2=val2" → { name: "xyz", scenario: { param1: 10, param2: "val2" } }
- "run-job name=monthly_etl, scenario=month=10,year=2025" → { name: "monthly_etl", scenario: { month: 10, year: 2025 } }
`;

  let spec = {
    aliases: ['run job', 'run-job', 'runjob'],
    name: 'run-job',
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
