/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {z} from 'zod';
import _getEnv from '../toolHelpers/_getEnv.js';
function getEnv(_appContext) {
    let description = `
## get-env — retrieve a variable value from the runtime environment

LLM Invocation Guidance (When to use)
Use THIS tool when:
- The user wants to access a specific environment variable or context value
- "What is the value of [variable name]?"
- "Get me the [variable] value"
- "Show the current [variable]"

Do NOT use this tool for:
- Retrieving table data (use read-table)
- Getting model information (use model-info)
- Looking up job status (use find-job or run-job)
- Setting environment variables (use set-context to set CAS/SAS contexts)

Purpose
Retrieve the current value of a named variable from the runtime environment. This is useful for debugging, accessing context information, or verifying current configuration values.

Parameters
- name (string, required): The name of the variable to retrieve. Variable names are case-sensitive.

Response Contract
Returns a JSON object containing:
- The requested variable name as a key
- The current value of that variable
- If the variable does not exist, returns null or an error message

Disambiguation & Clarification
- If variable name is missing: ask "Which variable would you like to retrieve?"
- If user says "context" without specifying which variable: clarify "Do you mean the CAS context, SAS context, or a specific variable?"
- Multiple variable request: handle one at a time or ask for clarification

Examples (→ mapped params)
- "What's the value of myVar" → { name: "myVar" }
- "Get me the configuration variable" → { name: "configuration" }
- "Show the current server setting" → { name: "server" }

Negative Examples (should NOT call get-env)
- "Read all rows from the customers table" (use read-table instead)
- "Get model details for myModel" (use model-info instead)
- "Set the CAS server to finance-prod" (use set-context instead)

Related Tools
- setContext — to set environment context values (CAS and SAS servers)
- readTable — to retrieve table data
- modelInfo — to retrieve model metadata
`;
  
    let spec = {
        name: 'get-env',
        aliases: ['get-env','get env','get environment'],
        description: description,
        schema: {
            name: z.string()
        },
       
        handler: async (params) => {
            return await _getEnv(params);
        }
    }
    return spec;
}
export default getEnv;
