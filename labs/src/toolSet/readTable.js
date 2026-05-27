/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import debug from 'debug';

import _readTable from  '../toolHelpers/_readTable.js';
function readTable(_appContext) {
   
     let describe = `
read-table â€” retrieve rows from a table in a CAS or SAS library.

USE when: read table, show rows, read from library, filtered data with WHERE
DO NOT USE for: list tables, table structure (use table-describe), SQL queries (use sas-query), SAS programs

PARAMETERS
- table: string â€” table name (required)
- lib: string â€” caslib or libref (required)
- server: string (default: 'cas') â€” 'cas' or 'sas'
- start: number (default: 1) â€” 1-based row index
- limit: number (default: 10) â€” max rows (1-1000)
- where: string â€” SQL WHERE clause filter
- format: boolean (default: true) â€” formatted or raw values

PARSING ROWS FROM USER INPUT
"first N rows/records"        → start: 1, limit: N   ("first" = count from beginning, never an offset)
"top N rows"                  → start: 1, limit: N
"N rows" / "N records"        → start: 1, limit: N
"read N rows from lib.table"  → lib: "lib", table: "table", start: 1, limit: N
"rows N to M"                 → start: N, limit: M-N+1
"starting from row N"         → start: N, limit: 10 (default)
(no count specified)          → start: 1, limit: 10 (default)

DOTTED FORMAT: "lib.table" → lib: "lib", table: "table" (split on first dot)

ROUTING RULES
- "read table cars in Samples" â†’ { table: "cars", lib: "Samples", start: 1, limit: 10 }
- "show 25 rows from customers" â†’ { table: "customers", lib: "<lib>", limit: 25, start: 1 }
- "read from mylib.orders where status='shipped'" â†’ { table: "orders", lib: "mylib", where: "status='shipped'", start: 1, limit: 10 }

EXAMPLES
- "read table cars in Samples" â†’ { table: "cars", lib: "Samples", start: 1, limit: 10 }
- "show 25 rows from customers" â†’ { table: "customers", lib: "mylib", limit: 25, start: 1 }

NEGATIVE EXAMPLES (do not route here)
- "list tables in Samples" (use list-tables)
- "what columns are in cars" (use table-describe)
- "execute SQL query" (use sas-query)
- "run SAS code" (use score-program)

ERRORS
Returns rows array, total count, filtered_count, columns metadata. Empty array if no matches.
  `;
  
    let  specs = {
      name: 'read-table',
      description: describe,
      inputSchema: z.object({
        table: z.string().min(1),
        lib: z.string().min(1).optional(),
        start: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(1000).optional(),
        server: z.enum(['cas', 'sas']).optional(),
        where: z.string().min(1).optional()
      }),
    handler: async (params) => {
      if (params.server == null) {
        params.server = 'cas';
      }
      let r = await _readTable(params,'query');
      return r;
      }
    }
    return specs;
}
export default readTable;


