/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _findScr from '../toolHelpers/_findScr.js';


function findScr(_appContext) {
  let description = `
find-scr â€” locate a specific SCR scr deployed to SCR server 

USE when: find scr, does scr exist, is scr deployed, lookup scr, verify scr exists
DO NOT USE for: list scrs (use list-scr), scr info/variables (use scr-describe), score scr (use scr-score), find table/job/lib (use respective tools), mas scr (use mas-describe/mas-score)


PARAMETERS
- name: string (required) â€” scr name to locate; if multiple supplied, use first

ROUTING RULES
- "find scr <name>" â†’ { name: "<name>" }
- "does scr <name> exist" â†’ { name: "<name>" }
- "is scr <name> deployed" â†’ { name: "<name>" }
- "lookup/verify scr <name>" â†’ { name: "<name>" }
- "find scr" with no name â†’ ask "Which scr name would you like to find?"
- "describe scr / scr info" â†’ use scr-describe instead

EXAMPLES
- "find scr myscr" â†’ { name: "myscr" }
- "does scr churn_score exist" â†’ { name: "churn_score" }
- "is scr riskscr deployed" â†’ { name: "riskscr" }
- "lookup scr claims_fraud_v1" â†’ { name: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list scr" (use ${_appContext.brand}-list-scr)
- "score scr myscr" (use ${_appContext.brand}-scr-score)
- "scr info for churnRisk" (use ${_appContext.brand}-scr-describe)

ERRORS
Returns { scr: [] } if not found; { scr: [name, ...] } if found. Never hallucinate scr urls.
  `;

  let spec = {
    name: 'find-scr',
    description: description,
    inputSchema: z.object({
      name: z.string()
    }),
    handler: async (params) => { 
      if (params.name.endsWith('.scr')) {
        params.name = params.name.slice(0, -4);
      }
      let r = await _findScr(params);
      return r;
    }
  }
  return spec;
}

export default findScr;


