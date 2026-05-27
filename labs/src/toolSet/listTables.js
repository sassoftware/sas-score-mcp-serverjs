/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import debug from 'debug';
import _listTables from '../toolHelpers/_listTables.js';


function listTables(_appContext) {
  const log = debug('tools');

    let description = `
list-tables â€” enumerate tables within a library.

USE when: list tables in <lib>, show tables in <lib>, next page
DO NOT USE for: find table, list libraries, get table structure (use table-describe), read data (use read-table)

PARAMETERS
- intent: must be 'list' — only pass if user explicitly asked to list/enumerate tables. Do NOT use for read, find, or verify.
- lib: string â€” library to inspect (required)
- server: string (default: 'cas') â€” 'cas' or 'sas'
- limit: number (default: 10) â€” page size
- start: number (default: 1) â€” 1-based offset
- where: string â€” optional filter expression

ROUTING RULES
- "list tables in Samples" â†’ { lib: "Samples", start: 1, limit: 10 }
- "list 25 tables in sashelp" â†’ { lib: "sashelp", limit: 25, start: 1 }
- "list cas tables in Public" â†’ { lib: "Public", server: "cas", start: 1, limit: 10 }

EXAMPLES
- "list tables in Samples" â†’ { lib: "Samples", start: 1, limit: 10 }
- "show 25 tables in sashelp" â†’ { lib: "sashelp", limit: 25, start: 1 }

NEGATIVE EXAMPLES (do not route here)
- "list libs" (use list-libraries)
- "find lib Public" (use find-library)
- "describe table cars" (use table-describe)
- "read table cars" (use read-table)
- "does table cars exist in Samples" (use find-table)
- "is table iris in Public" (use find-table)
- "verify table orders in mylib" (use find-table)

ERRORS
Returns empty array if no tables found.
  `;
    
  let spec = {
    name: 'list-tables',
    description: description,

    inputSchema: z.object({
      intent: z.literal('list'),
      lib: z.string(),
      server: z.string().optional(),
      limit: z.number().optional(),
      start: z.number().optional(),
      where: z.string().optional()
    }),
    handler: async (params) => {
      const { intent, ...rest } = params;
      let r = await _listTables(rest);
      return r;
    }
  }
  return spec;
}

export default listTables;


