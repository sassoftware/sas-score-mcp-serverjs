/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function runCasProgram(_appContext) {
  let description = `
## run-cas-program

Execute a cas program on a SAS Viya server

Required Parameters
- src(string, required): The cas program to execute. 

Optional Parameters:

- scenario (string | object ,optional): Input values to program/ Accepts:
  - a comma-separated key=value string (e.g. "x=1, y=2"),
  - a JSON object with field names and values (recommended for typed inputs),

LLM Invocation Guidance
Use THIS tool when the user wants to run a Cas program on the server:
- "run cas program 'action echo / code='aaaa'"
- "cas program 'action echo / code='aaaa'"
- 'submit cas "action echo / code='aaaa'"'


Do NOT use this tool when the user wants:
- run macro -> use run-macro
- submit sas -> use run-sas-program
- run job -> use run-job
- run sas  -> use run-sas-program
- run jobdef -> use run-jobdef
- run job -> use run-job
- list jobs -> use list-jobs
- list jobdefs -> use list-jobdefs
- find job -> use find-job
- find jobdef -> use find-jobdef
- find model -> use find-model


Behavior & usage notes
- This tool sends the supplied \`src\` verbatim to the SAS execution helper. It does not modify or validate the SAS code.
- For invoking pre-defined SAS macros, prefer the \`runMacro\` helper which converts simple parameter formats into \`%let\` statements and invokes the macro cleanly.
- Be cautious when executing arbitrary code — validate or sanitize inputs in untrusted environments.

Response
- If output is specified and the specified table exists in the response, display the data as a markdown table. 
Examples
- run program "data a; x=1; run;"  - this is the simplest usage  -- {src= "data a; x=1; run;", folder=" ", output=" ", limit=100}
- program "data work.a; x=1; run;" output=a limit=50  -- {src= "data work.a; x=1; run;", folder=" ", output="a", limit=50}

- run program sample folder=/Public/models output=A limit=50 -- {src= "sample", folder="/Public/models", output="A", limit=50}
- run program sample folder=/Public/models scenario="name='John', age=45" output=a limit=50 -- {src= "sample", folder="/Public/models", scenario: {name: "John", age: 45}, output="a", limit=50}
- run program sample folder=/Public/models with scenario name=John,age=45 output=a limit=50  -- {src= "sample.sas", folder="/Public/models", scenario: {name: "John", age: 45}, output="a", limit=50}
  - this should be the same as the previous example and is just a different syntax. The result should be
    {program: "sample", folder: "/Public/models", scenario: {name: "John", age: 45}, output: "a", limit: 50}
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

export default runCasProgram;
