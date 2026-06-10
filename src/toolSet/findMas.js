/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _findMas from '../toolHelpers/_findMas.js';


function findMas(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
find-mas — verify a MAS model exists.
PARAMS: name (string, required)
RETURNS: model metadata if found, error if not found
` : `
find-mas â€” locate a specific MAS mas deployed to MAS server 

USE when: find mas, does mas exist, is mas deployed, lookup mas, verify mas exists
DO NOT USE for: list mass (use ${_appContext.brand}-list-mass), mas info/variables (use ${_appContext.brand}-mas-describe), score mas (use ${_appContext.brand}-mas-score), find table/job/lib (use respective tools), scr mass (use ${_appContext.brand}-scr-describe/${_appContext.brand}-scr-score)

PARAMETERS
- name: string (required) â€” mas name to locate; if multiple supplied, use first

ROUTING RULES
- "find mas <name>" â†’ { name: "<name>" }
- "find name.mas" â†’ { name: "<name>" }
- "does mas <name> exist" â†’ { name: "<name>" }
- "is mas <name> deployed" â†’ { name: "<name>" }
- "lookup/verify mas <name>" â†’ { name: "<name>" }
- "find mas" with no name â†’ ask "Which mas name would you like to find?"
- "find all mass / list mass" â†’ use ${_appContext.brand}-list-mas instead
- "describe mas / mas info" â†’ use ${_appContext.brand}-mas-describe instead

EXAMPLES
- "find mas mymas" â†’ { name: "mymas" }
- "does mas churn_score exist" â†’ { name: "churn_score" }
- "is mas riskmas deployed" â†’ { name: "riskmas" }
- "lookup mas claims_fraud_v1" â†’ { name: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list mass" (use ${_appContext.brand}-list-mas)
- "score mas mymas" (use ${_appContext.brand}-mas-score)
- "mas info for churnRisk" (use ${_appContext.brand}-mas-describe)

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
      if (params.name != null) {
        if (params.name.endsWith('.mas'))   {
          params.name = params.name.slice(0, -4);
        }
      }
      params.tool = 'find';
      let r = await _findMas(params);
      return r;
    }
  }
  return spec;
}

export default findMas;


