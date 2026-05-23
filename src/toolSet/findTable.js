/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
//import debug from 'debug';
import _findTable from '../toolHelpers/_findTable.js';

function findTable(_appContext) {
  let description = `
find-table — locate a specific table in a CAS or SAS library.

USE when: find table, does table exist, is table in library, verify table exists, locate table
DO NOT USE for: list tables (use ${_appContext.brand}-list-tables), table schema/columns (use ${_appContext.brand}-table-info), read table data (use ${_appContext.brand}-read-table), find lib/job/model (use respective tools)

PARAMETERS
- lib: string (required) — library name (e.g., 'Public', 'sashelp')
- name: string (required) — table name to locate
- server: 'cas' | 'sas' . If not specified set it to 'cas' — target environment

ROUTING RULES
- "find table <name> in <lib>" → { lib: "<lib>", name: "<name>", server: "cas" }
- "find table <name> in <lib> in sas" → { lib: "<lib>", name: "<name>", server: "sas" }
- "does table <name> exist in <lib>" → { lib: "<lib>", name: "<name>", server: "cas" }
- "find table" with missing lib → ask "Which library contains the table?"
- "find table" with missing name → ask "Which table name would you like to find?"
- "list tables in <lib>" → use ${_appContext.brand}-list-tables instead

EXAMPLES
- "find table iris in Public" → { lib: "Public", name: "iris", server: "cas" }
- "find table cars in sashelp in sas" → { lib: "sashelp", name: "cars", server: "sas" }
- "does customers exist in mylib" → { lib: "mylib", name: "customers", server: "cas" }
- "verify table orders in Samples" → { lib: "Samples", name: "orders", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "list tables in Public" (use ${_appContext.brand}-list-tables)
- "find library Public" (use ${_appContext.brand}-find-library)
- "what columns in cars?" (use ${_appContext.brand}-table-info)
- "read data from customers" (use ${_appContext.brand}-read-table)

ERRORS
Returns { tables: [] } if not found; { tables: [name, ...] } if found. Never hallucinate table names.
  `;
  
  let spec = {
    name: 'find-table',
    description: description,
    inputSchema: z.object({
      lib: z.string(),
      name: z.string(),
      server: z.string() 
    }),
    
    handler: async (params) => {
      // Check if the params.scenario is a string and parse it
      let r = await _findTable(params);
      return r;
    }
  }
  return spec;
}

export default findTable;

