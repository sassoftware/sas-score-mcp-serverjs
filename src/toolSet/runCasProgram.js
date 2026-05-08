/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function runCasProgram(_appContext) {
  let description = `
run-cas-program — execute a CAS program on SAS Viya server.

USE when: run cas program, execute cas, submit cas, cas action
DO NOT USE for: macros (use run-macro), sas code (use run-sas-program), jobs (use run-job), jobdefs (use run-jobdef)

PARAMETERS
- src: string (required) — CAS program to execute verbatim
- scenario: string or object (optional) — input parameters
- folder: string — server folder path for .sas files
- output: string — table name to return in response
- limit: number (default: 100) — max rows to return

ROUTING RULES
- run cas program action echo → { src: action echo }
- execute cas action simple.summary → { src: action simple.summary }

EXAMPLES
- run cas program action echo → { src: action echo }
- cas program sample folder=/Public/models → { src: sample, folder: /Public/models }

NEGATIVE EXAMPLES (do not route here)
- run sas macro (use run-macro)
- submit sas code (use run-sas-program)
- run job X (use run-job)

NOTES
Sends src verbatim without validation. For SAS macros use run-macro. For arbitrary SAS code use run-sas-program.

RESPONSE
Log output and CAS results. If output table specified, returned as markdown table.
`;

  let spec = {
    name: 'run-cas-program',
    description: description,
    inputSchema:z.object({
      src: z.string(),
      scenario: z.any(),
      output: z.string().optional(),
      folder: z.string().optional(),
      limit: z.number().optional()
    }),
    
  // NOTE: Previously 'required' incorrectly listed 'program' which does not
  // exist in the schema. This prevented execution in some orchestrators that
  // enforce required parameter presence, causing only descriptions to appear.
  // Corrected to 'src'.
    handler: async (params) => {
      let {src, folder, scenario, _appContext} = params;
      // figure out src
      let isrc = src;
      if (folder != null && folder.trim().length > 0) {
        if (isrc.indexOf('.sas') < 0) {
          isrc = isrc + '.sas';
        }
        isrc = `
          filename mcptemp filesrvc folderpath="${folder}";
          %include mcptemp("${isrc}");
          filename mcptemp clear;
        `;
      }
      // figure out macros

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
  
      let iparms = {
        args: scenario,
        output: params.output,
        limit: params.limit,
        src: isrc,
        _appContext: _appContext
      }
     // console.error('iparms', iparms);
      let r = await _submitCode(iparms);
      return r;
    }
  }
  return spec;
}

export default runCasProgram;

