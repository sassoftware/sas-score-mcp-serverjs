/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _scrInfo from '../toolHelpers/_scrInfo.js';

function scrInfo(_appContext) {

  let description = `
## scr-info

Purpose
Return the input/output schema and metadata for an SCR (Score Code Runtime) model.

Inputs
- url (string): The SCR model identifier. 
What it returns
- A JSON object describing the model's interface, typically including:
  - Input variables (names, types, required/optional)
  - Output variables (predictions, probabilities, scores)
  

Usage notes
- Ensure network connectivity and credentials for the remote SCR service when needed.
- Use scr-score to score data after inspecting the schema.

Examples
- describe scr model "https://scr-host/models/loan"
- info for scr model "https://scr-host/models/loan"
`;

  let spec = {
    name: 'scr-info',
    description: description,
    inputSchema: z.object({
      url: z.string()
    }),
    handler: async (params) => {
      let {url, _appContext} = params;
      if (url === null) {
        return { status: { statusCode: 2, msg: `SCR model ${url} not found` }, results: {} };
      }
      let r = await _scrInfo({url, _appContext});
      return r;
    }
  }
  return spec;
}

export default scrInfo;
