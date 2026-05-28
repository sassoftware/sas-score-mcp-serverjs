/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
//import debug from 'debug';
import _findTable from '../toolHelpers/_findTable.js';

function findTable(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
find-table — verify a table exists in a library.
PARAMS: lib (string, required), name (string, required), server ('cas'|'sas', optional)
RETURNS: table metadata if found, error if not found
` : `
find-table â€” locate a specific table in a CAS or SAS library.

USE when: find table, does table exist, is table in library, verify table exists, locate table
DO NOT USE for: list tables (use ${_appContext.brand}-list-tables), table schema/columns (use ${_appContext.brand}-table-describe), read table data (use ${_appContext.brand}-read-table), find lib/job/model (use respective tools)

PARAMETERS
- lib: string (required) â€” library name (e.g., 'Public', 'sashelp')
- name: string (required) â€” table name to locate
- server: 'cas' | 'sas' . If not specified set it to 'cas' â€” target environment

ROUTING RULES
- "find table <name> in <lib>" â†’ { lib: "<lib>", name: "<name>", server: "cas" }
- "find table <name> in <lib> in sas" â†’ { lib: "<lib>", name: "<name>", server: "sas" }
- "does table <name> exist in <lib>" â†’ { lib: "<lib>", name: "<name>", server: "cas" }
- "find table" with missing lib â†’ ask "Which library contains the table?"
- "find table" with missing name â†’ ask "Which table name would you like to find?"
- "list tables in <lib>" â†’ use ${_appContext.brand}-list-tables instead

EXAMPLES
- "find table iris in Public" â†’ { lib: "Public", name: "iris", server: "cas" }
- "find table cars in sashelp in sas" â†’ { lib: "sashelp", name: "cars", server: "sas" }
- "does customers exist in mylib" â†’ { lib: "mylib", name: "customers", server: "cas" }
- "verify table orders in Samples" â†’ { lib: "Samples", name: "orders", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "list tables in Public" (use ${_appContext.brand}-list-tables)
- "find library Public" (use ${_appContext.brand}-find-library)
- "what columns in cars?" (use ${_appContext.brand}-table-describe)
- "read data from customers" (use ${_appContext.brand}-read-table)

ERRORS
Returns { tables: [] } if not found; { tables: [name, ...] } if found. Never hallucinate table names.
  `;
  
  let spec = {
    name: 'find-table',
    description: description,
    inputSchema: z.object({
      lib: z.string().min(1),
      name: z.string().min(1),
      server: z.enum(['cas', 'sas'])
    }),
    
    handler: async (params) => {
      // Check if the params.scenario is a string and parse it
      params.tool = 'find';
      let r = await _findTable(params);
      return r;
    }
  }
  return spec;
}

export default findTable;


