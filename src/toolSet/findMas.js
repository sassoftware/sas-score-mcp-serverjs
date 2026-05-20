/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _findmas from '../toolHelpers/_findmas.js';


function findMas(_appContext) {
  let description = `
find-mas — locate a specific MAS mas deployed to MAS server 

USE when: find mas, does mas exist, is mas deployed, lookup mas, verify mas exists
DO NOT USE for: list mass (use list-mass), mas info/variables (use mas-info), score mas (use mas-score), find table/job/lib (use respective tools), scr mass (use scr-info/scr-score)

PARAMETERS
- name: string (required) — mas name to locate; if multiple supplied, use first

ROUTING RULES
- "find mas <name>" → { name: "<name>" }
- "does mas <name> exist" → { name: "<name>" }
- "is mas <name> deployed" → { name: "<name>" }
- "lookup/verify mas <name>" → { name: "<name>" }
- "find mas" with no name → ask "Which mas name would you like to find?"
- "find all mass / list mass" → use list-mass instead
- "describe mas / mas info" → use mas-info instead

EXAMPLES
- "find mas mymas" → { name: "mymas" }
- "does mas churn_score exist" → { name: "churn_score" }
- "is mas riskmas deployed" → { name: "riskmas" }
- "lookup mas claims_fraud_v1" → { name: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list mass" (use list-mass)
- "score mas mymas" (use mas-score)
- "mas info for churnRisk" (use mas-info)

ERRORS
Returns { mass: [] } if not found; { mass: [name, ...] } if found. Never hallucinate mas names.
  `;

  let spec = {
    name: 'find-mas',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => { 
      let r = await _findmas(params);
      return r;
    }
  }
  return spec;
}

export default findMas;

