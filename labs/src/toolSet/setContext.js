/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {z} from 'zod';

function setContext(_appContext) {
    let description = `
set-context — set the CAS and SAS server contexts for subsequent tool calls.

USE when: switch to CAS server, change compute context, check current context, set both
DO NOT USE for: get variables (use get-env), read data (use read-table), run programs (use run-sas-program)

PARAMETERS
- cas: string — CAS server name (optional), e.g. 'cas-shared-default', 'finance-cas-server'
- sas: string — SAS compute context (optional), e.g. 'SAS Studio Compute Context', 'batch-compute'

ROUTING RULES
- "use finance-cas-server" → { cas: "finance-cas-server" }
- "switch to SAS Studio Compute Context" → { sas: "SAS Studio Compute Context" }
- "use finance-cas for CAS and batch-compute for SAS" → { cas: "finance-cas", sas: "batch-compute" }
- "what context am I using" → { } (no params, returns current)

EXAMPLES
- "use finance-cas-server" → { cas: "finance-cas-server" }
- "switch to batch-compute" → { sas: "batch-compute" }
- "what's my current context" → { }

NEGATIVE EXAMPLES (do not route here)
- "read table cars" (use read-table)
- "what's the value of X" (use get-env)
- "run program" (use run-sas-program)

ERRORS
Returns current or updated context values {cas, sas}. Error if server not found or invalid name.
  `;
  
    let spec = {
    name: 'set-context',
    description: description,
        inputSchema: z.object({
      cas: z.string().optional(),
      sas: z.string().optional()
    }),
    handler: async (params) => {
            
            let {cas, sas} = params;
            if (typeof cas === 'string' && cas.trim().length > 0) {
                _appContext.contexts.cas = cas.trim();
            }
            if (typeof sas === 'string' && sas.trim().length > 0) {
                _appContext.contexts.sas = sas.trim();
            }
            // Return a structured response without extraneous keys
            return {
                content: [{ type: 'text', text: JSON.stringify(_appContext.contexts) }],
                structuredContent: _appContext.contexts
            };
        }
    }
    return spec;
}
export default setContext;

