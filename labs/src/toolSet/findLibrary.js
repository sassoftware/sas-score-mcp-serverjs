/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listLibrary from '../toolHelpers/_listLibrary.js';
function findLibrary(_appContext) {
  
  let description = `
find-library — locate a specific CAS or SAS library.

USE when: find library, find lib, does library exist, is library available, lookup library
DO NOT USE for: list libraries (use list-libraries), find table/job/jobdef/model (use respective tools), table structure (use table-info), create library (use run-sas-program)

PARAMETERS
- name: string (required) — library/caslib name; if multiple supplied, use first
- server: 'cas' | 'sas' (default: 'cas') — target environment

ROUTING RULES
- "find lib <name>" → { name: "<name>", server: "cas" }
- "find lib <name> in cas" → { name: "<name>", server: "cas" }
- "find library <name> in sas" → { name: "<name>", server: "sas" }
- "does library <name> exist" → { name: "<name>", server: "cas" }
- "find lib" with no name → ask "Which library name would you like to find?"
- "list libraries / list libs" → use list-libraries instead
- "tables in <lib>" → use list-tables instead

EXAMPLES
- "find lib Public" → { name: "Public", server: "cas" }
- "find library sasuser in sas" → { name: "sasuser", server: "sas" }
- "does library Formats exist" → { name: "Formats", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "list libs" (use list-libraries)
- "show tables in Public" (use list-tables)
- "find table cars in sashelp" (use find-table)
- "find job cars_job" (use find-job)

ERRORS
Returns { libraries: [] } if not found; { libraries: [name, ...] } if found. Never hallucinate library names.
  `;

  let spec = {
    name: 'find-library',
    description: description,
    inputSchema: z.object({
      name: z.string(),
      server: z.string().optional()
    }),
    
    handler: async (params) => {
      // normalize server to lowercase & default
      if (!params.server) params.server = 'cas';
      params.server = params.server.toLowerCase();

      // If multiple names passed (comma or space separated), take the first token (defensive)
      if (params.name && /[,\s]+/.test(params.name.trim())) {
        params.name = params.name.split(/[,\s]+/).filter(Boolean)[0];
      }

      let r = await _listLibrary(params);
      return r;
    }
  }
  return spec;
}
export default findLibrary;

