/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _findJobdef from '../toolHelpers/_findJobdef.js';
function findJobdef(_appContext) {
  let llmDescription= {
  "purpose": "Map natural language requests to find a jobdef (job definition) in SAS Viya and return structured results.",
  "param_mapping": {
    "name": "required - single name. If missing, ask 'Which jobdef name would you like to find?'.",

  },
  "response_schema": "{ jobs: Array<string|object> }",
  "behavior": "Return only JSON matching response_schema when invoked by an LLM. If no matches, return { jobs: [] }"
};
  let description = `
find-jobdef — locate a specific SAS Viya job definition.

USE when: find jobdef, does jobdef exist, is there a jobdef named, lookup jobdef, verify jobdef exists
DO NOT USE for: list jobdefs (use ${_appContext.brand}-list-jobdefs), run jobdef (use ${_appContext.brand}-run-jobdef), find job/lib/table/model (use respective tools)

PARAMETERS
- name: string (required) — jobdef name to locate; if multiple supplied, use first

ROUTING RULES
- "find jobdef <name>" → { name: "<name>" }
- "find name.jobdef" → { name: "<name>" }
- "does jobdef <name> exist" → { name: "<name>" }
- "is there a jobdef named <name>" → { name: "<name>" }
- "lookup/verify jobdef <name>" → { name: "<name>" }
- "find jobdef" with no name → ask "Which jobdef name would you like to find?"
- "find all jobdefs / list jobdefs" → use ${_appContext.brand}-list-jobdefs instead
- "run jobdef <name>" → use ${_appContext.brand}-run-jobdef instead

EXAMPLES
- "find jobdef cars_job_v4" → { name: "cars_job_v4" }
- "does jobdef ETL exist" → { name: "ETL" }
- "is there a jobdef named metricsRefresh" → { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobdefs" (use ${_appContext.brand}-list-jobdefs)
- "run jobdef cars_job_v4" (use ${_appContext.brand}-run-jobdef)
- "find job ETL" (use ${_appContext.brand}-find-job)
- "find table cars" (use ${_appContext.brand}-find-table)

ERRORS
Returns { jobdefs: [] } if not found; { jobdefs: [name, ...] } if found. Never hallucinate jobdef names.
  `;

  let spec = {
    name: 'find-jobdef',
    description: description,
    inputSchema: z.object({
        name: z.string()
    }),
    handler: async (params) => {
      if (params.name != null) {
        if (params.name.endsWith('.jobdef'))   {
          params.name = params.name.slice(0, -7);
        }
      }
      params.tool = 'find';
      let r = await _findJobdef(params);
      return r;
    }
  }
  return spec;
}
export default findJobdef;

