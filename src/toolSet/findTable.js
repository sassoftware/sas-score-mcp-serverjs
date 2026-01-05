/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
//import debug from 'debug';
import _listTables from '../toolHelpers/_listTables.js';

function findTable(_appContext) {
  let description = `
## find-table — locate a specific table in a CAS or SAS library

LLM Invocation Guidance (When to use)
Use THIS tool when the user wants to find or verify a table in a specific library:
- "find table iris in Public library in cas"
- "find table cars in sashelp in sas server"
- "does table customers exist in mylib?"
- "is there a table named sales in the Samples library?"
- "verify table orders exists in Public"

Do NOT use this tool when the user wants:
- find lib -> use find-library
- find model -> use find-model
- find job -> use find-job
- find jobdef -> use find-jobdef
- Columns or schema of a table (use table-info)
- Reading data from a table (use read-table)
- Listing all tables in a library (use list-tables)

Purpose
Locate a table contained in a specified library (caslib or libref) on a CAS or SAS server. Returns matching table names or empty array if not found.

Parameters
- lib (string, required): The library to search in (e.g., 'Public', 'sashelp', or a caslib name)
- name (string, required): Table name or substring to search for. Matching is case-insensitive.
- server (string, default 'cas'): Either 'cas' or 'sas'. Defaults to 'cas' when omitted.

Response Contract
Returns a JSON object with:
- tables: Array of matching table names (strings)
- Empty array { tables: [] } when no matches found
- Do not fabricate table names; only return actual matches

Disambiguation & Clarification
- Missing library: ask "Which library do you want to search in?"
- Missing table name: ask "Which table name would you like to find?"
- Server ambiguous: ask "Do you mean CAS or SAS?"
- If user wants multiple tables: suggest "Use list-tables to see all tables in a library"

Examples (→ mapped params)
- "find table iris in Public library in cas" → { lib: "Public", name: "iris", server: "cas" }
- "find table cars in sashelp in sas server" → { lib: "sashelp", name: "cars", server: "sas" }
- "does customers exist in mylib" → { lib: "mylib", name: "customers", server: "cas" }
- "verify table orders in Samples" → { lib: "Samples", name: "orders", server: "cas" }

Negative Examples (should NOT call find-table)
- "list tables in Public" (use list-tables instead)
- "find library Public" (use find-library instead)
- "what columns in cars table?" (use table-info instead)
- "read data from customers" (use read-table instead)

Usage Tips
- Use this tool to verify table existence before reading or querying
- For discovery of multiple tables, use list-tables instead
- After finding a table, use table-info for schema or read-table for data

Related Tools
- find-table → table-info → read-table (typical workflow)
- list-tables — to discover all tables in a library
- find-library — to verify library exists
- table-info — to inspect table structure after finding it
`;
  
  let spec = {
    name: 'find-table',
    aliases: ['findTable','find table','find_table'],
    description: description,
    schema: {
      server: z.string().default('cas'), // default server is 'cas',
      name: z.string(),
      lib: z.string()
    },
    required: ['name', 'lib'],
    handler: async (params) => {
      // Check if the params.scenario is a string and parse it
      let r = await _listTables(params);
      return r;
    }
  }
  return spec;
}

export default findTable;
