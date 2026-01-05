/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function runProgram(_appContext) {
  let description = `
## run-sas-program — execute SAS code or programs on SAS Viya server

LLM Invocation Guidance (When to use)
Use THIS tool when the user wants to run a SAS program on the server:
- "run program 'data a; x=1; run;'"
- "execute this SAS code: proc print data=sashelp.cars; run;"
- "program 'data work.a; x=1; run;' output=a limit=50"
- "run sas program sample folder=/Public/models output=A limit=50"
- "run sas program with parameters name=John, age=45"
- "execute SAS file myprogram.sas from /Public folder"

Do NOT use this tool when the user wants:
- run macro -> use run-macro
- run job -> use run-job
- run jobdef -> use run-jobdef
- list jobs -> use list-jobs
- list jobdefs -> use list-jobdefs
- find job -> use find-job
- find jobdef -> use find-jobdef
- find model -> use find-model
- Query tables with SQL -> use sas-query
- Read table data -> use read-table

Purpose
Execute SAS code or programs on a SAS Viya server. Can run inline SAS code or execute .sas files stored on the server. Supports parameter passing via scenario values and can return output tables.

Parameters
- src (string, required): The SAS program to execute. Can be either:
  - Inline SAS code as a string (e.g., "data a; x=1; run;")
  - Name of a .sas file stored on the server (used with folder parameter)
- folder (string, default ''): Server folder path where the .sas file is located (e.g., "/Public/models")
- scenario (string | object, optional): Input parameter values. Accepts:
  - Comma-separated key=value string (e.g., "x=1, y=2")
  - JSON object with field names and values (recommended)
- output (string, default ''): Table name to return in response (case-sensitive)
- limit (number, default 100): Maximum number of rows to return from output table

Response Contract
Returns a JSON object containing:
- log: Execution log from SAS
- ods: ODS output if generated
- tables: Array of table names created during execution
- data: If output parameter specified, returns the table data (up to limit rows)
- error: Error message if execution fails
- Empty content if no results produced

Disambiguation & Clarification
- Missing SAS code: ask "What SAS program or code would you like to execute?"
- Inline code vs file unclear: ask "Do you want to run inline SAS code or execute a .sas file from the server?"
- If output table not returned: clarify "The output table name is case-sensitive. Did you specify the exact name?"
- If unclear about parameters: ask "What parameter values should I pass to the program?"

Examples (→ mapped params)
- "run program 'data a; x=1; run;'" → { src: "data a; x=1; run;", folder: "", output: "", limit: 100 }
- "program 'data work.a; x=1; run;' output=a limit=50" → { src: "data work.a; x=1; run;", folder: "", output: "a", limit: 50 }
- "run sas program sample folder=/Public/models output=A limit=50" → { src: "sample", folder: "/Public/models", output: "A", limit: 50 }
- "run program mycode.sas in /Public with name=John, age=45" → { src: "mycode", folder: "/Public", scenario: { name: "John", age: 45 }, output: "", limit: 100 }

Negative Examples (should NOT call run-sas-program)
- "run macro summarize" (use run-macro instead)
- "run job monthly_report" (use run-job instead)
- "run jobdef etl_process" (use run-jobdef instead)
- "how many customers by region in Public.customers" (use sas-query instead)
- "read 10 rows from cars" (use read-table instead)

Behavior & Usage Notes
- Sends the supplied src verbatim to the SAS execution helper
- For .sas files, specify the file name (with or without .sas extension) and the folder path
- For invoking pre-defined SAS macros, prefer run-macro which handles %let statements automatically
- Scenario values are converted to macro variables when provided
- Be cautious when executing arbitrary code in production environments

Related Tools
- run-macro — for executing predefined SAS macros with parameters
- run-job — for executing registered Job Execution assets
- sas-query — for natural language SQL queries
- read-table — for simple data retrieval
`;

  let spec = {
    name: 'run-sas-program',
    aliases: ['Program','run program'],
    description: description,
    schema: {
      src: z.string(),
      scenario: z.any().default(''),
      output: z.string().default(''),
      folder: z.string().default(''),
      limit: z.number().default(100)
    },
  // NOTE: Previously 'required' incorrectly listed 'program' which does not
  // exist in the schema. This prevented execution in some orchestrators that
  // enforce required parameter presence, causing only descriptions to appear.
  // Corrected to 'src'.
  required: ['src'],
    handler: async (params) => {
      let {src, folder, scenario, _appContext} = params;
      // figure out src
      let isrc = src;
      if (folder != null && folder.trim().length > 0) {
        if (isrc.indexOf('.sas') < 0) {
          isrc = isrc + '.sas';
        }
        isrc = `
          filename mcptemp filesrvc folderpath="${folder}";
          %include mcptemp("${isrc}");
          filename mcptemp clear;
        `;
      }
      // figure out macros
  
      if (typeof scenario === 'string' && scenario.includes('=')) {
        scenario = scenario.split(',').reduce((acc, pair) => {
          const [k, ...rest] = pair.split('=');
          if (!k) return acc;
          acc[k.trim()] = rest.join('=').trim();
          return acc;
        }, {});
      }
      let iparms = {
        args: scenario,
        output: params.output,
        limit: params.limit,
        src: isrc,
        _appContext: _appContext
      }
     // console.error('iparms', iparms);
      let r = await _submitCode(iparms);
      return r;
    }
  }
  return spec;
}

export default runProgram;
