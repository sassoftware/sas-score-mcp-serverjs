/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _submitCode from '../toolHelpers/_submitCode.js';


function macroScore(_appContext) {
  let description = `
macro-score — submit and execute a SAS macro on SAS Viya server.

USE when: run macro, execute macro with parameters
DO NOT USE for: arbitrary SAS code (use program-score), jobs, jobdefs

PARAMETERS
- macro: string — macro name without "%" (required)
- scenario: string — parameters or setup code (optional). Accepts: "x=1, y=abc" or "%let x=1; %let y=abc;"

ROUTING RULES
- "run macro abc" → { macro: "abc", scenario: "" }
- "run macro abc with x=1, y=2" → { macro: "abc", scenario: "x=1, y=2" }
- "run macro xyz with %let a=1; %let b=2;" → { macro: "xyz", scenario: "%let a=1; %let b=2;" }

EXAMPLES
- "run macro abc" → { macro: "abc", scenario: "" }
- "run macro summarize with x=1, y=2" → { macro: "summarize", scenario: "x=1, y=2" }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use program-score)
- "run job X" (use job-score)
- "run jobdef X" (use jobdef-score)

ERRORS
Returns log, ods, tables created by macro. Auto-converts "x=1, y=2" to "%let x=1; %let y=2;" format.
  `;

  let spec = {
    name: 'macro-score',
    description: description,

    inputSchema: z.object({
      macro: z.string(),
      scenario: z.string().optional()
    }),

    handler: async (params) => {
      const scenarioRaw = (params.scenario || '').trim();
      let setup = '';
      if (scenarioRaw) {
        // If the scenario already contains macro syntax, send it through unchanged
        const hasMacroSyntax = /%let\b|%[a-zA-Z_]\w*\s*\(|%[a-zA-Z_]\w*\s*;/.test(scenarioRaw) || scenarioRaw.includes('%');
        if (hasMacroSyntax) {
          setup = scenarioRaw;
        } else {
          // Convert "x=1,y=abc" -> "%let x=1; %let y=abc;"
          setup = scenarioRaw.split(',')
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => {
              const [k, ...rest] = p.split('=');
              if (!k) return '';
              const key = k.trim();
              const val = rest.join('=').trim();
              return `%let ${key}=${val};`;
            })
            .filter(Boolean)
            .join(' ');
        }
      }
      const src = `${setup} %${params.macro};`;
      params.src = src;
      let r = await _submitCode(params);
      return r;
    }
  }
  return spec;
}

export default macroScore;
