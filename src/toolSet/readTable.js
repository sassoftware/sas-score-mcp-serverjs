/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import debug from 'debug';

import _readTable from  '../toolHelpers/_readTable.js';
function readTable(_appContext) {
   
     let describe = `
read-table — retrieve rows from a table in a CAS or SAS library.

USE when: read table, show rows, read from library, filtered data with WHERE
DO NOT USE for: list tables, table structure (use table-info), SQL queries (use sas-query), SAS programs

PARAMETERS
- table: string — table name (required)
- lib: string — caslib or libref (required)
- server: string (default: 'cas') — 'cas' or 'sas'
- start: number (default: 1) — 1-based row index
- limit: number (default: 10) — max rows (1-1000)
- where: string — SQL WHERE clause filter
- format: boolean (default: true) — formatted or raw values

ROUTING RULES
- "read table cars in Samples" → { table: "cars", lib: "Samples", start: 1, limit: 10 }
- "show 25 rows from customers" → { table: "customers", lib: "<lib>", limit: 25, start: 1 }
- "read from mylib.orders where status='shipped'" → { table: "orders", lib: "mylib", where: "status='shipped'", start: 1, limit: 10 }

EXAMPLES
- "read table cars in Samples" → { table: "cars", lib: "Samples", start: 1, limit: 10 }
- "show 25 rows from customers" → { table: "customers", lib: "mylib", limit: 25, start: 1 }

NEGATIVE EXAMPLES (do not route here)
- "list tables in Samples" (use list-tables)
- "what columns are in cars" (use table-info)
- "execute SQL query" (use sas-query)
- "run SAS code" (use run-sas-program)

ERRORS
Returns rows array, total count, filtered_count, columns metadata. Empty array if no matches.
  `;
  
    let  specs = {
      name: 'read-table',
      description: describe,
      inputSchema: z.object({
        table: z.string(),
        lib: z.string().optional(),
        start: z.number().optional(),
        limit: z.number().optional(),
        server: z.string().optional(),
        where: z.string().optional()
      }),
    handler: async (params) => {
        let r = await _readTable(params,'query');
        return r;
      }
    }
    return specs;
}
export default readTable;
