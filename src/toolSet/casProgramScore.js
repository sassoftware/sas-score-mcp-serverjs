/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function casProgramScore(_appContext) {
  const isAgent = _appContext && _appContext.agent;

  let description = isAgent ? `
cas-program-score — execute a CAS program model.
PARAMS: src (string, required), folder (string, optional), scenario (string|object, optional), output (string, optional), limit (number, optional)
RETURNS: log output and CAS results, optional output table rows
` : `
cas-program-score — execute a CAS program model on SAS Viya server.

USE when: score cas program, run cas program, execute CAS action, submit CASL
DO NOT USE for: macros (use macro-score), SAS code (use program-score), jobs (use job-score), jobdefs (use jobdef-score)

PARAMETERS
- src: string (required) — CAS program or CASL code to execute verbatim
- scenario: string or object (optional) — input parameters
- folder: string — server folder path for .sas files
- output: string — table name to return in response
- limit: number (default: 100) — max rows to return

ROUTING RULES
- "run cas program action echo" → { src: "action echo" }
- "execute cas action simple.summary" → { src: "action simple.summary" }
- "score cas program sample folder=/Public/models" → { src: "sample", folder: "/Public/models" }

EXAMPLES
- "run cas program action echo" → { src: "action echo" }
- "cas program sample folder=/Public/models" → { src: "sample", folder: "/Public/models" }

NEGATIVE EXAMPLES (do not route here)
- "score sas macro" (use macro-score)
- "submit sas code" (use program-score)
- "score job X" (use job-score)
- "score jobdef X" (use jobdef-score)

NOTES
Sends src verbatim without validation. For SAS macros use macro-score. For arbitrary SAS code use program-score.

RESPONSE
Log output and CAS results. If output table specified, returned as markdown table.
`;

  let spec = {
    name: 'cas-program-score',
    description: description,
    inputSchema: z.object({
      src: z.string(),
      scenario: z.any(),
      output: z.string().optional(),
      folder: z.string().optional(),
      limit: z.number().optional()
    }),
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

      // Convert the scenario string to an object
      // Example: "x=1, y=2, z=3" to { x: 1, y: 2, z: 3 }
      let scenarioObj = {};
      if (typeof scenario === 'object' && scenario !== null) {
        scenarioObj = scenario;
      } else if (Array.isArray(scenario)) {
        scenarioObj = scenario[0];
      } else if (typeof scenario === 'string' && scenario.includes('=')) {
        scenarioObj = scenario.split(',').reduce((acc, pair) => {
          let [key, value] = pair.split('=');
          acc[key.trim()] = value;
          return acc;
        }, {});
      }
      params.scenario = scenarioObj;

      let iparms = {
        args: scenarioObj,
        output: params.output,
        limit: params.limit,
        src: isrc,
        _appContext: _appContext
      }
      let r = await _submitCode(iparms);
      return r;
    }
  }
  return spec;
}

export default casProgramScore;
