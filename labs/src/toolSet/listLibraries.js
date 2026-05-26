/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listLibrary from '../toolHelpers/_listLibrary.js';
function listLibraries(_appContext) {
  let description = `
list-libraries — enumerate CAS or SAS libraries.

USE ONLY when: user explicitly asks to list, browse, or enumerate libraries — "list libraries", "show all libs", "browse libraries", "what libraries are available", "next page". Never use to verify if a specific library exists.
DO NOT USE for: verify or check if a specific library exists (use find-library instead), listing tables in a library (→ list-tables), column/table metadata, job execution, models, scoring.

PARAMETERS
- server: 'cas' | 'sas' | 'all' (default: 'all')
- limit: integer > 0 (default: 10)
- start: 1-based offset (default: 1)
- where: optional filter expression (default: '')

ROUTING RULES
- "cas libs / cas libraries / in cas"         → { server: 'cas' }
- "sas libs / sas libraries / in sas"         → { server: 'sas' }
- "all libs / all libraries"                  → { server: 'all' }
- "list tables in <libname>"                  → route to list-tables, NOT here
- server unspecified                          → default { server: 'all' }
- "all cas libs" with no limit specified      → { server: 'cas', limit: 50 } + paging note
- "next" after prior call (start:S, limit:L) → { start: S + L, limit: L }
- ambiguous "list" or "libs" with no context → assume { server: 'cas' }

EXAMPLES
- "list libraries"              → { server: 'all', start: 1, limit: 10 }
- "list libs     "              → { server: 'all', start: 1, limit: 10 }

- "list all libs"               → { server: 'all', start: 1, limit: 10 }
- "list cas libraries"          → { server: 'cas', start: 1, limit: 10 }
- "show me 25 sas libs"         → { server: 'sas', limit: 25, start: 1 }
- "next" (prev: start:1,limit:10) → { server: <same>, start: 11, limit: 10 }
- "filter cas libs" (no filter given) → ask: "What filter expression should I apply?"

NEGATIVE EXAMPLES (do not route here)
- "list tables in SASHELP"      → list-tables
- "list models / jobs / jobdefs"→ respective tools
- "run a program to create a lib" → run-sas-program
- "does library Public exist" → find-library
- "is library SASHELP available" → find-library
- "find library mylib" → find-library

PAGINATION
If returned item count === limit, hint: next start = start + limit.
If start > 1 and result is empty, note paging may have exceeded available items.

ERRORS
Return structured error with a message field. Never hallucinate library names.
`;


  // Canonical kebab-case tool name; legacy aliases preserved for compatibility
  
 
  let spec = {
    name: 'list-libraries',
    description: description,
    inputSchema: z.object({
      server: z.enum(['cas', 'sas', 'all']).optional(),
      limit: z.number().int().min(1).optional(),
      start: z.number().int().min(1).optional(),
      where: z.string().min(1).optional()
    }),
    // 'server' has a default so we don't mark it required
    handler: async (params) => {
      // normalize server just in case caller sends 'CAS'/'SAS'
      params.server = (params.server || 'all').toLowerCase();
      
      let r = await _listLibrary(params);
      return r;
    }
  };
  return spec;
}
export default listLibraries;
     
