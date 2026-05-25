/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {z} from 'zod';
import _getEnv from '../toolHelpers/_getEnv.js';
function getEnv(_appContext) {
    let description = `
get-env â€” retrieve a variable value from the runtime environment.

USE when: what is the value of, get me, show current, what's the, retrieve environment variable
DO NOT USE for: read table data (use read-table), model info (use model-info), find/run job (use find-job/score-job), set context (use set-context)

PARAMETERS
- name: string (required) â€” variable name to retrieve (case-sensitive)

ROUTING RULES
- "what is the value of <var>" â†’ { name: "<var>" }
- "get me <var>" â†’ { name: "<var>" }
- "show <var>" â†’ { name: "<var>" }
- "get" with no variable â†’ ask "Which variable would you like to retrieve?"
- "what context am I using" â†’ use set-context instead (no params)
- "set <var> to <value>" â†’ use set-context or score-program instead

EXAMPLES
- "What's the value of myVar" â†’ { name: "myVar" }
- "Get me the configuration variable" â†’ { name: "configuration" }
- "Show the current server setting" â†’ { name: "server" }

NEGATIVE EXAMPLES (do not route here)
- "Read rows from customers" (use read-table)
- "Get model details for myModel" (use model-info)
- "Set the CAS server to finance-prod" (use set-context)

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


