/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import debug from 'debug';

import _tableInfo  from '../toolHelpers/_tableInfo.js';
import { type } from 'node:os';
function tableInfo(_appContext) {

     let describe = `
table-info — retrieve metadata about a table in a CAS or SAS library.

USE when: what columns, describe structure, show schema, table statistics, column info
DO NOT USE for: read data (use read-table), list tables (use list-tables), find table (use find-table), queries (use sas-query)

PARAMETERS
- table: string — table name (required)
- lib: string — caslib or libref (required)
- server: string (default: 'cas') — 'cas' or 'sas'

ROUTING RULES
- "what columns are in cars" → { table: "cars", lib: "<lib>", server: "cas" }
- "describe table sales in Public" → { table: "sales", lib: "Public", server: "cas" }
- "show schema for mylib.iris on sas" → { table: "iris", lib: "mylib", server: "sas" }

EXAMPLES
- "what columns in cars" → { table: "cars", lib: "<lib>", server: "cas" }
- "describe structure of customers in Public" → { table: "customers", lib: "Public", server: "cas" }

NEGATIVE EXAMPLES (do not route here)
- "read table cars" (use read-table)
- "list tables in Public" (use list-tables)
- "does table exist" (use find-table)
- "query table" (use sas-query)

ERRORS
Returns columns array (name, type, label, format, length) and tableInfo (rowCount, fileSize, created, modified).
  `;
   
    let  specs = {
      name: 'table-info',
      description: describe,
      inputSchema: z.object({
        table: z.string(),
        lib: z.string().optional(),
        server: z.string().optional()
      }),
    handler: async (params) => {
        params.describe = true;
        let r = await _tableInfo(params);
        return r;
      }
    }
    return specs;
}
export default tableInfo;
