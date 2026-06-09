/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _casScore from '../toolHelpers/_casScore.js';

function casModelScore(_appContext) {
  const isAgent = _appContext && _appContext.agent;

  let description = isAgent ? `
cas-model-score — score with a model persisted as a CAS table in a CAS server.
PARAMS:  name(string, required), model(string, optional),scenario (string|object, optional)
RETURNS: returns the score for the specified scenario
Notes: name is specified as a.b.cas where a is the library, b is the CAS table name, and .cas is the suffix. Model parameter is optional and can be used to specify a different model name if it is not the same as the table name.
` : `
cas-model-score — execute a CAS model on SAS Viya  cas server.

USE when:  score cas model with scenario
DO NOT USE for: macros (use ${_appContext.brand}-macro-score), SAS code (use ${_appContext.brand}-program-score), jobs (use ${_appContext.brand}-job-score), jobdefs (use ${_appContext.brand}-jobdef-score), scr(use ${_appContext.brand}-scr-score)

PARAMETERS

- name: string (optional) — CAS model table to use for scoring
- model: string (optional) — name of the model to use for scoring, if different from the table name
- scenario: string or object (optional) — input parameters


ROUTING RULES
- "score "mymodel.abc.cas" with scenario "x=1, y=2" → { name: "mymodel.abc", scenario: "x=1, y=2" }
 

EXAMPLES
- "score "mymodel.abc.cas" with scenario "x=1, y=2" → { name: "mymodel.abc", scenario: "x=1, y=2" }

NEGATIVE EXAMPLES (do not route here)
- "score sas macro" (use ${_appContext.brand}-macro-score)
- "submit sas code" (use ${_appContext.brand}-program-score)
- "score job X" (use ${_appContext.brand}-job-score)
- "score jobdef X" (use ${_appContext.brand}-jobdef-score)
- "score scr X" (use ${_appContext.brand}-scr-score)




RESPONSE
Log output and CAS results. If output table is specified, that table's rows up to the limit.
`;

  let spec = {
    name: 'cas-model-score',
    description: description,
    inputSchema: z.object({
      scenario: z.any().optional(),
      model: z.string().optional(),
      name: z.string()
    }),
    handler: async (params) => {
      let {name, model, scenario, _appContext} = params;
      // figure out src
  

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
        model: params.model,
        name: params.name,
        _appContext: _appContext
      }
      let r =  await _casScore(iparms); 
      return r;
    }
  }
  return spec;
}

export default casModelScore;
