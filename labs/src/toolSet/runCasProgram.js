/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function runCasProgram(_appContext) {
  let description = `
run-cas-program â€” execute a CAS program on SAS Viya server.

USE when: run cas program, execute cas, submit cas, cas action
DO NOT USE for: macros (use score-macro), sas code (use score-program), jobs (use score-job), jobdefs (use score-jobdef)

PARAMETERS
- src: string (required) â€” CAS program to execute verbatim
- scenario: string or object (optional) â€” input parameters
- folder: string â€” server folder path for .sas files
- output: string â€” table name to return in response
- limit: number (default: 100) â€” max rows to return

ROUTING RULES
- run cas program action echo â†’ { src: action echo }
- execute cas action simple.summary â†’ { src: action simple.summary }

EXAMPLES
- run cas program action echo â†’ { src: action echo }
- cas program sample folder=/Public/models â†’ { src: sample, folder: /Public/models }

NEGATIVE EXAMPLES (do not route here)
- run sas macro (use score-macro)
- submit sas code (use score-program)
- run job X (use score-job)

NOTES
Sends src verbatim without validation. For SAS macros use score-macro. For arbitrary SAS code use score-program.

RESPONSE
Log output and CAS results. If output table specified, returned as markdown table.
`;

  let spec = {
    name: 'run-cas-program',
    description: description,
    inputSchema:z.object({
      src: z.string(),
      scenario: z.string(),
      output: z.string().optional,
      folder: z.string().optional,
      limit: z.number().optional
    }),
    
  // NOTE: Previously 'required' incorrectly listed 'program' which does not
  // exist in the schema. This prevented execution in some orchestrators that
  // enforce required parameter presence, causing only descriptions to appear.
  // Corrected to 'src'.
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


