/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCasl from '../toolHelpers/_submitCasl.js';
import _casScore from '../toolHelpers/_casScore.js';

function casProgramScore(_appContext) {
  const isAgent = _appContext && _appContext.agent;

  let description = isAgent ? `
cas-program-score — execute a CAS program src code or score a persisted CAS model on SAS Viya server.
PARAMS: src (string, required), model(string,optional), name(string, optional),scenario (string|object, optional), output (string, optional), limit (number, optional)
RETURNS: log output and CAS results, optional output table rows
` : `
cas-program-score — execute a CAS program model on SAS Viya server.

USE when: score cas program, run cas program,  submit CASL, score cas model with scenario
DO NOT USE for: macros (use ${_appContext.brand}-macro-score), SAS code (use ${_appContext.brand}-program-score), jobs (use ${_appContext.brand}-job-score), jobdefs (use ${_appContext.brand}-jobdef-score), scr(use ${_appContext.brand}-scr-score)

PARAMETERS
- src: string (required) — CAS program or CASL code to execute verbatim
- casmodel: string (optional) — CAS model table to use for scoring
- name: string (optional) — name of the model to use for scoring, if different from the table name
- scenario: string or object (optional) — input parameters
- output: string — table name to return in response
- limit: number (default: 100) — max rows to return

**NOTE** if both src and casmodel are specified, the casmodel will take precedence
ROUTING RULES
- "run cas program "action echo" → { src: "action echo" }
- "execute cas "action simple.summary" with table=a.b → { src: "action simple.summary",scenario: {
table: "a.b"} }
- "score casmodel "mymodel.abc" with scenario "x=1, y=2" → { casmodel: "mymodel.abc", scenario: "x=1, y=2" }
 

EXAMPLES
- "run cas program "action echo" → { src: "action echo" }
- "score casmodel "mymodel.abc" with scenario "x=1, y=2" → { casmodel: "mymodel.abc", scenario: "x=1, y=2" }

NEGATIVE EXAMPLES (do not route here)
- "score sas macro" (use ${_appContext.brand}-macro-score)
- "submit sas code" (use ${_appContext.brand}-program-score)
- "score job X" (use ${_appContext.brand}-job-score)
- "score jobdef X" (use ${_appContext.brand}-jobdef-score)
- "score scr X" (use ${_appContext.brand}-scr-score)

NOTES
Sends src verbatim without validation. Use parameter scenario to pass arguments. For arbitrary SAS code use ${_appContext.brand}-program-score.

RESPONSE
Log output and CAS results. If output table is specified, that table's rows up to the limit.
`;

  let spec = {
    name: 'cas-program-score',
    description: description,
    inputSchema: z.object({
      src: z.string(),
      scenario: z.any().optional(),
      output: z.string().optional(),
      casmodel: z.string().optional(),
      name: z.string().optional(),  
      limit: z.number().optional()
    }),
    handler: async (params) => {
      let {src, scenario, _appContext} = params;
      // figure out src
      let isrc = src;

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
        model: params.casmodel,
        name: params.name,
        _appContext: _appContext
      }
      let r = (params.casmodel == null) ? await _submitCasl(iparms) : await _casScore(iparms);
      return r;
    }
  }
  return spec;
}

export default casProgramScore;
