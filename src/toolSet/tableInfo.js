/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import debug from 'debug';

import _tableInfo  from '../toolHelpers/_tableInfo.js';
function tableInfo(_appContext) {

     let describe = `
## table-info — retrieve metadata about a table in a CAS or SAS library

LLM Invocation Guidance (When to use)
Use THIS tool when:
- User wants table structure/schema: "what columns are in the cars table?"
- User wants column metadata: "describe the structure of customers table"
- User wants to see data types: "show me the schema for sales table in Public"
- User wants table statistics: "how many rows in the orders table?"
- User wants column information: "what are the columns in the iris table?"

Do NOT use this tool for:
- Reading actual data rows (use read-table)
- Listing tables in a library (use list-tables)
- Checking if a table exists (use find-table)
- Running queries (use sas-query)
- Reading sample data (use read-table)

Purpose
Return metadata about a table in a specified library (caslib or libref). This includes column names, data types, labels, formats, and table-level statistics such as row count, file size, and timestamps.

Parameters
- table (string, required): The name of the table to inspect.
- lib (string, required): The caslib or libref containing the table.
- server (string, default 'cas'): Target server, either 'cas' or 'sas'. Defaults to 'cas' when omitted.

Response Contract
Returns a JSON object containing:
- columns: Array of column objects with:
  - name: Column name (string)
  - type: Data type (string) - e.g., 'numeric', 'character'
  - label: Column label if defined (string)
  - format: Display format if defined (string)
  - length: Column length for character fields (number)
- tableInfo: Table-level metadata including:
  - rowCount: Number of rows (number)
  - fileSize: File size if available (number)
  - created: Creation timestamp if available (string)
  - modified: Last modified timestamp if available (string)
- Empty object if table not found or accessible

Disambiguation & Clarification
- Missing library: ask "Which library contains the table you want to inspect?"
- Missing table: ask "Which table would you like information about?"
- If user wants data: clarify "Do you want the table structure (use table-info) or actual data rows (use read-table)?"
- Ambiguous lib.table format: parse and use as separate parameters

Examples (→ mapped params)
- "describe table cars in sashelp" → { table: "cars", lib: "sashelp", server: "sas" }
- "what columns are in orders from Public" → { table: "orders", lib: "Public", server: "cas" }
- "show schema for sales in mylib" → { table: "sales", lib: "mylib", server: "cas" }
- "table info for iris in Samples" → { table: "iris", lib: "Samples", server: "cas" }
- "how many rows in customers on cas" → { table: "customers", lib: <lib>, server: "cas" }

Negative Examples (should NOT call table-info)
- "read 10 rows from cars" (use read-table instead)
- "list tables in sashelp" (use list-tables instead)
- "does table cars exist in Public?" (use find-table instead)
- "run query on customers table" (use sas-query instead)
- "show me data from the sales table" (use read-table instead)

Usage Tips
- Use this tool to inspect schema and column types before scoring or reading data.
- After inspecting structure, use read-table to fetch actual data.
- Combine with find-table to verify existence before inspection.

Related Tools
- find-table → table-info → read-table (typical workflow)
- list-tables — to discover tables before inspecting
- read-table — to fetch actual data after inspecting structure
- find-table — to verify a table exists before inspection
`;
   
    let  specs = {
      name: 'table-info',
      aliases: ['tableInfo','table info','table_info'],
      description: describe,
      schema: {
        table: z.string(),
        lib: z.string(),
        server: z.string()
      },
      required: ['table', 'lib'],
      handler: async (params) => {
        params.describe = true;
        let r = await _tableInfo(params);
        return r;
      }
    }
    return specs;
}
export default tableInfo;