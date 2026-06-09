/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _scrDescribe from '../toolHelpers/_scrDescribe.js';

function scrDescribe(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
scr-describe — return input/output schema for a SCR model.
PARAMS: intent ('describe', required), name (string, required)
RETURNS: input/output schema and model metadata
` : `
scr-describe -  return the input/output schema and metadata for an SCR (Score Code Runtime) model.

Inputs
- intent: must be 'describe' — only pass if user explicitly asked to describe/inspect an SCR model. Do NOT use for find or verify existence.
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
      intent: z.literal('describe'),
      name: z.string()
    }),
    handler: async (params) => {
      const { intent, name, _appContext } = params;
      if (name === null) {
        return { status: { statusCode: 2, msg: `SCR model ${name} not found` }, results: {} };
      }
      let r = await _scrDescribe({name, _appContext});
      return r;
    }
  }
  return spec;
}

export default scrDescribe;
