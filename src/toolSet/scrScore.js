/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _scrScore from '../toolHelpers/_scrScore.js';

function scrScore(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
scr-score — score a scenario using a SCR model endpoint.
PARAMS: name (string, required), scenario (object, optional)
RETURNS: SCR endpoint response with predictions merged with inputs
` : `
scr-score -  score a scenario using a model deployed as a SCR container in Azure or another host.

Inputs
- name (string, required): SCR model identifier (URL)
- scenario (object, optional): Input values to score as a JSON object (e.g. {age:45, income:60000}). If omitted, defaults to {} and the tool will return the model's input variable definitions.

What it returns
- When scoring: the SCR endpoint response (predictions, probabilities, scores) merged with or alongside the supplied inputs.
- When \`scenario\` is omitted: metadata describing the model's input variables (names, types, required/optional).

Usage notes
- Run \`scr-describe\` first to inspect the expected input variables and types.
- Prefer structured objects for numeric/date values to avoid type ambiguity; the simple string parser keeps values as strings.
- Ensure network connectivity and any required credentials for the target SCR service.

Examples
- scrScore with name="loan" and scenario={age:45, income:60000}
`;

  let spec = {
    name: 'scr-score',
    description: description,
    inputSchema: z.object({
      name: z.string(),
      scenario: z.union([z.record(z.any()), z.string()]).optional()
    }),
    
    handler: async (params) => {
      let {name, _appContext} = params;
      let scenario = params.scenario;
      if (typeof scenario === 'string') {
        try { scenario = JSON.parse(scenario); } catch { scenario = {}; }
      }
      if (name === null) {
        return { status: { statusCode: 2, msg: `SCR model ${name} was not specified` }, results: {} };
      }

      const scenarioObj = (scenario != null && typeof scenario === 'object') ? scenario : {};

      let r = await _scrScore({ name: name, scenario: scenarioObj, _appContext: _appContext});
      return r;
    }
  }

  return spec;
}

export default scrScore;
