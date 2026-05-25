/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';

function runProgram(_appContext) {
  let description = `
score-program â€” execute SAS code or programs on SAS Viya server.

USE when: run program, execute SAS code, run .sas file
DO NOT USE for: macros (use score-macro), jobs (use score-job), jobdefs (use score-jobdef), SQL queries (use sas-query), read data (use read-table)

PARAMETERS
- src: string â€” SAS code or .sas filename (required)
- folder: string (default: '') â€” server folder path for .sas files
- scenario: string | object â€” parameter values. Accepts: "x=1, y=2" or {x:1, y:2}
- output: string (default: '') â€” table name to return (case-sensitive)
- limit: number (default: 100) â€” max rows from output

ROUTING RULES
- "run program 'data a; x=1; run;'" â†’ { src: "data a; x=1; run;", folder: "", output: "", limit: 100 }
- "run sas program sample folder=/Public/models" â†’ { src: "sample", folder: "/Public/models", output: "", limit: 100 }
- "run program with name=John, age=45" â†’ { src: "<code>", scenario: {name:"John", age:45}, output: "", limit: 100 }

EXAMPLES
- "run program 'data a; x=1; run;'" â†’ { src: "data a; x=1; run;", folder: "", output: "", limit: 100 }
- "run sas file sample in /Public" â†’ { src: "sample", folder: "/Public", output: "", limit: 100 }

NEGATIVE EXAMPLES (do not route here)
- "run macro X" (use score-macro)
- "run job X" (use score-job)
- "run jobdef X" (use score-jobdef)
- "SQL query" (use sas-query)
- "read table" (use read-table)

ERRORS
Returns log, ods, tables array, data (if output specified). Error if execution fails.
  `;

  let spec = {
    name: 'score-program',
    description: description,
    inputSchema: z.object({
      src: z.string(),
      scenario: z.string().optional(),
      output: z.string().optional(),
      folder: z.string().optional(),
      limit: z.number().optional()
    }),
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


