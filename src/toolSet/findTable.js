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
- server: 'cas' | 'sas' (REQUIRED — must always be explicitly provided; never omit or leave null)

ROUTING RULES
- server MUST be 'cas' or 'sas' — determine it from library context BEFORE calling this tool
- Known CAS libraries: Casuser, Formats, ModelPerformanceData, Models, Public, Samples, SystemData → server: "cas"
- Known SAS libraries: MAPS, MAPSGFK, MAPSSAS, SASDQREF, SASHELP, SASUSER, WORK → server: "sas"
- Unknown library: try cas first, then sas if not found — always pass an explicit server value each call
- "find table <name> in <lib>" → determine server from lib, then call with explicit server
- "find table <name> in <lib> on sas" → { lib: "<LIB>", name: "<name>", server: "sas" }
- "find table" with missing lib → ask "Which library contains the table?"
- "find table" with missing name → ask "Which table name would you like to find?"
- "list tables in <lib>" → use ${_appContext.brand}-list-tables instead

EXAMPLES
- "find table iris in Public" → { lib: "Public", name: "iris", server: "cas" }   (Public is a known CAS lib)
- "find table cars in sashelp" → { lib: "SASHELP", name: "cars", server: "sas" }  (SASHELP is a known SAS lib)
- "does customers exist in mylib" → try { lib: "mylib", name: "customers", server: "cas" }, then server: "sas" if not found
- "verify table orders in Samples" → { lib: "Samples", name: "orders", server: "cas" }  (Samples is a known CAS lib)

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
      server: z.enum(['cas', 'sas'])
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

