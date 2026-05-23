/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {z} from 'zod';
import _getEnv from '../toolHelpers/_getEnv.js';
function getEnv(_appContext) {
    let description = `
get-env — retrieve a variable value from the runtime environment.

USE when: what is the value of, get me, show current, what's the, retrieve environment variable
DO NOT USE for: read table data (use ${_appContext.brand}-read-table), model info (use ${_appContext.brand}-model-info), find/run job (use ${_appContext.brand}-find-job/${_appContext.brand}-run-job), set context (use ${_appContext.brand}-set-context)

PARAMETERS
- name: string (required) — variable name to retrieve (case-sensitive)

ROUTING RULES
- "what is the value of <var>" → { name: "<var>" }
- "get me <var>" → { name: "<var>" }
- "show <var>" → { name: "<var>" }
- "get" with no variable → ask "Which variable would you like to retrieve?"
    - "what context am I using" → use ${_appContext.brand}-set-context instead (no params)
    - "set <var> to <value>" → use ${_appContext.brand}-set-context or ${_appContext.brand}-run-sas-program instead

EXAMPLES
- "What's the value of myVar" → { name: "myVar" }
- "Get me the configuration variable" → { name: "configuration" }
- "Show the current server setting" → { name: "server" }

NEGATIVE EXAMPLES (do not route here)
-- "Read rows from customers" (use ${_appContext.brand}-read-table)
-- "Get model details for myModel" (use ${_appContext.brand}-model-info)
-- "Set the CAS server to finance-prod" (use ${_appContext.brand}-set-context)

ERRORS
Returns variable name with current value, or null if not found. Return structured error with message field.
    `;
  
    let spec = {
    name: 'get-env',
    description: description,
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        },
    handler: async (params) => {
            return await _getEnv(params);
        }
    }
    return spec;
}
export default getEnv;

