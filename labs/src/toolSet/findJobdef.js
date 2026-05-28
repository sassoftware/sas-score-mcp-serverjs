/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
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
find-jobdef â€” locate a specific SAS Viya job definition.

USE when: find jobdef, does jobdef exist, is there a jobdef named, lookup jobdef, verify jobdef exists
DO NOT USE for: list jobdefs (use list-jobdefs), run jobdef (use jobdef-score), find job/lib/table/model (use respective tools)

PARAMETERS
- name: string (required) â€” jobdef name to locate; if multiple supplied, use first

ROUTING RULES
- "find jobdef <name>" â†’ { name: "<name>" }
- "does jobdef <name> exist" â†’ { name: "<name>" }
- "is there a jobdef named <name>" â†’ { name: "<name>" }
- "lookup/verify jobdef <name>" â†’ { name: "<name>" }
- "find jobdef" with no name â†’ ask "Which jobdef name would you like to find?"
- "find all jobdefs / list jobdefs" â†’ use list-jobdefs instead
- "run jobdef <name>" â†’ use jobdef-score instead

EXAMPLES
- "find jobdef cars_job_v4" â†’ { name: "cars_job_v4" }
- "does jobdef ETL exist" â†’ { name: "ETL" }
- "is there a jobdef named metricsRefresh" â†’ { name: "metricsRefresh" }

NEGATIVE EXAMPLES (do not route here)
- "list jobdefs" (use list-jobdefs)
- "run jobdef cars_job_v4" (use jobdef-score)
- "find job ETL" (use find-job)
- "find table cars" (use find-table)

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
      let r = await _listJobdefs(params);
      return r;
    }
  }
  return spec;
}
export default findJobdef;


