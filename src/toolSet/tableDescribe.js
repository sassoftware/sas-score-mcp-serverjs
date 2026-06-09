/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import debug from 'debug';

import _tableInfo  from '../toolHelpers/_tableDescribe.js';
function tableDescribe(_appContext) {
  const isAgent = _appContext && _appContext.agent;
     let describe = isAgent ? `
table-describe — return column schema for a table.
PARAMS: intent ('describe', required), lib (string, required), table (string, required), server ('cas'|'sas', required)
RETURNS: column names, types, labels, formats; table row count and file size
` : `
table-describe -  retrieve metadata about a table in a CAS or SAS library.

USE when: what columns, describe structure, show schema, table statistics, column info
DO NOT USE for: read data (use read-table), list tables (use list-tables), find table (use find-table), queries (use sas-query)

PARAMETERS
- intent: must be 'describe' — only pass if user explicitly asked to describe/inspect table structure. Do NOT use for read data, find table, or verify existence.
- table: string â€” table name (required)
- lib: string â€” caslib or libref (required)
- server: string (default: 'cas') â€” 'cas' or 'sas'

ROUTING RULES
- "what columns are in cars" â†’ { table: "cars", lib: "<lib>", server: "cas" }
- "describe table sales in Public" â†’ { table: "sales", lib: "Public", server: "cas" }
- "show schema for mylib.iris on sas" â†’ { table: "iris", lib: "mylib", server: "sas" }

EXAMPLES
- "what columns in cars" â†’ { table: "cars", lib: "<lib>", server: "cas" }
- "describe structure of customers in Public" â†’ { table: "customers", lib: "Public", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "read table cars" (use read-table)
- "list tables in Public" (use list-tables)
- "does table exist" (use find-table)
- "query table" (use sas-query)

ERRORS
Returns { columns: [...], sampleData: [...] }. Error if table not found or server unreachable.
  `;
   
    let  specs = {
      name: 'table-describe',
      description: describe,
      inputSchema: z.object({
        intent: z.literal('describe'),
        table: z.string(),
        lib: z.string().optional(),
        server: z.string().optional()
      }),
    handler: async (params) => {
        const { intent, ...rest } = params;
        rest.tool = 'describe';
        let r = await _tableInfo(rest);
        return r;
      }
    }
    return specs;
}
export default tableDescribe;

