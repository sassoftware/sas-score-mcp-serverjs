/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listLibrary from '../toolHelpers/_listLibrary.js';
function findLibrary(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
find-library — verify a library exists.
PARAMS: name (string, required), server ('cas'|'sas', optional)
RETURNS: library metadata if found, error if not found
` : `
find-library â€” locate a specific CAS or SAS library.

USE when: find library, find lib, does library exist, is library available, lookup library
DO NOT USE for: list libraries (use ${_appContext.brand}-list-libraries), find table/job/jobdef/model (use respective tools), table structure (use ${_appContext.brand}-table-describe), create library (use ${_appContext.brand}-program-score)

PARAMETERS
- name: string (required) â€” library/caslib name; if multiple supplied, use first
- server: 'cas' | 'sas' (default: 'cas') â€” target environment

ROUTING RULES
- "find lib <name>" â†’ { name: "<name>", server: "cas" }
- "find lib <name> in cas" â†’ { name: "<name>", server: "cas" }
- "find library <name> in sas" â†’ { name: "<name>", server: "sas" }
- "does library <name> exist" â†’ { name: "<name>", server: "cas" }
- "find lib" with no name â†’ ask "Which library name would you like to find?"
- "list libraries / list libs" â†’ use ${_appContext.brand}-list-libraries instead
- "tables in <lib>" â†’ use ${_appContext.brand}-list-tables instead

EXAMPLES
- "find lib Public" â†’ { name: "Public", server: "cas" }
- "find library sasuser in sas" â†’ { name: "sasuser", server: "sas" }
- "does library Formats exist" â†’ { name: "Formats", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "list libs" (use ${_appContext.brand}-list-libraries)
- "show tables in Public" (use ${_appContext.brand}-list-tables)
- "find table cars in sashelp" (use ${_appContext.brand}-find-table)
- "find job cars_job" (use ${_appContext.brand}-find-job)

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
      params.tool = 'find';
      let r = await _listLibrary(params);
      return r;
    }
  }
  return spec;
}
export default findLibrary;


