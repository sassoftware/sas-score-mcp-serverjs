/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {z} from 'zod';

function setContext(_appContext) {
    let description = `
## set-context — set the CAS and SAS server contexts for subsequent tool calls

LLM Invocation Guidance (When to use)
Use THIS tool when:
- User wants to switch to a different CAS server: "Use the finance-cas-server"
- User wants to change the compute context: "Switch to 'SAS Studio Compute Context'"
- User wants to check current context: "What context am I using?"
- User wants to set both: "Use finance-cas-server for CAS and my-compute for SAS"

Do NOT use this tool for:
- Retrieving variable values (use get-env)
- Reading table data (use read-table)
- Running programs or queries (use run-sas-program or sas-query)
- Listing available servers or contexts (no tool for this; would require backend support)

Purpose
Set the active CAS server and/or SAS compute context for all subsequent tool calls in this session. This allows switching between different server environments. If neither parameter is provided, the tool returns the current context values.

Parameters
- cas (string, optional): The name of the CAS server to use for subsequent CAS operations. Examples: 'cas-shared-default', 'finance-cas-server', 'analytics-cas'
- sas (string, optional): The name of the SAS compute context to use for subsequent SAS operations. Examples: 'SAS Studio Compute Context', 'my-compute', 'batch-compute'

Response Contract
Returns a JSON object containing:
- cas: The current/new CAS server name (string or null)
- sas: The current/new SAS compute context name (string or null)
- If no parameters provided, returns the current context values
- If parameters provided, updates and returns the new context values
- On error: error message if context cannot be set (e.g., invalid server name)

Disambiguation & Clarification
- If user says "switch servers" without specifying which: ask "Which server would you like to use: CAS, SAS, or both?"
- If user provides a server name that may not exist: proceed with setting it (the backend will validate)
- If user says "reset context": ask "Should I reset the CAS context, SAS context, or both?"
- If user only says "context": ask "Would you like to check the current context or set a new one?"

Examples (→ mapped params)
- "Use the finance-cas-server" → { cas: "finance-cas-server" }
- "Switch to SAS Studio Compute Context" → { sas: "SAS Studio Compute Context" }
- "Set CAS to prod-cas and SAS to batch-compute" → { cas: "prod-cas", sas: "batch-compute" }
- "What's my current context?" → { } (no parameters returns current context)
- "Show me the active CAS server" → { } (no parameters returns current context)

Negative Examples (should NOT call set-context)
- "Read 10 rows from the customers table" (use read-table instead)
- "What's the value of myVariable?" (use get-env instead)
- "Run this SAS program" (use run-sas-program instead)

Related Tools
- get-env — to retrieve individual environment variable values
- read-table — to read data using the current context
- run-sas-program — to execute SAS programs in the current context
- sas-query — to execute SQL queries in the current context
`;
  
    let spec = {
        name: 'set-context',
        aliases: ['setContext','set context','set_context'],
        description: description,
        schema: {
            cas: z.string().optional(),
            sas: z.string().optional()
        },
       
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
