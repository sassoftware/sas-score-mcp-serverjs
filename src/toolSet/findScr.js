/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _findScr from '../toolHelpers/_findScr.js';


function findScr(_appContext) {
  let description = `
find-scr — locate a specific SCR scr deployed to SCR server 

USE when: find scr, does scr exist, is scr deployed, lookup scr, verify scr exists
DO NOT USE for: list scrs (use list-scr), scr info/variables (use scr-info), score scr (use scr-score), find table/job/lib (use respective tools), mas scr (use mas-info/mas-score)


PARAMETERS
- url: string (required) — scr url to locate; if multiple supplied, use first

ROUTING RULES
- "find scr <url>" → { url: "<url>" }
- "does scr <url> exist" → { url: "<url>" }
- "is scr <url> deployed" → { url: "<url>" }
- "lookup/verify scr <url>" → { url: "<url>" }
- "find scr" with no url → ask "Which scr url would you like to find?"
- "describe scr / scr info" → use scr-info instead

EXAMPLES
- "find scr myscr" → { url: "myscr" }
- "does scr churn_score exist" → { url: "churn_score" }
- "is scr riskscr deployed" → { url: "riskscr" }
- "lookup scr claims_fraud_v1" → { url: "claims_fraud_v1" }

NEGATIVE EXAMPLES (do not route here)
- "list scr" (use ${_appContext.brand}-list-scr)
- "score scr myscr" (use ${_appContext.brand}-scr-score)
- "scr info for churnRisk" (use ${_appContext.brand}-scr-info)

ERRORS
Returns { scr: [] } if not found; { scr: [url, ...] } if found. Never hallucinate scr urls.
  `;

  let spec = {
    url: 'find-scr',
    description: description,
    inputSchema: z.object({
      url: z.string()
    }),
    handler: async (params) => { 
      if (params.url.endsWith('.scr')) {
        params.url = params.url.slice(0, -4);
      }
      let r = await _findScr(params);
      return r;
    }
  }
  return spec;
}

export default findScr;

