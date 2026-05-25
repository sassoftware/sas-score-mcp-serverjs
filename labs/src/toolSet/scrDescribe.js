/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _scrInfo from '../toolHelpers/_scrInfo.js';

function scrDescribe(_appContext) {

  let description = `
## scr-describe

Purpose
Return the input/output schema and metadata for an SCR (Score Code Runtime) model.

Inputs
- name (string): The SCR model identifier.
What it returns
- A JSON object describing the model's interface, typically including:
  - Input variables (names, types, required/optional)
  - Output variables (predictions, probabilities, scores)


Usage notes
- Ensure network connectivity and credentials for the remote SCR service when needed.
- Use scr-score to score data after inspecting the schema.

Examples
- describe scr model "loan"
- info for scr model "loan"
`;

  let spec = {
    name: 'scr-describe',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => {
      let {name, _appContext} = params;
      if (name === null) {
        return { status: { statusCode: 2, msg: `SCR model ${name} not found` }, results: {} };
      }
      let r = await _scrInfo({name, _appContext});
      return r;
    }
  }
  return spec;
}

export default scrDescribe;

