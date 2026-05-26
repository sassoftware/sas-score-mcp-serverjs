/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import debug from 'debug';
import _listTables from '../toolHelpers/_listTables.js';


function listTables(_appContext) {
  const log = debug('tools');

    let description = `
list-tables — enumerate tables within a library.

USE ONLY when: user explicitly asks to browse or enumerate tables — "list tables in X", "show tables in X", "show all tables in X", "browse tables in X", "what tables are in X", "next page"
DO NOT USE for: verify or check if a specific table exists (use find-table instead), find table, list libraries, get table structure (use table-info), read data (use read-table)

PARAMETERS
- lib: string — library to inspect (required)
- server: string (default: 'cas') — 'cas' or 'sas'
- limit: number (default: 10) — page size
- start: number (default: 1) — 1-based offset
- where: string — optional filter expression

ROUTING RULES
- "list tables in Samples" → { lib: "Samples", start: 1, limit: 10 }
- "list 25 tables in sashelp" → { lib: "sashelp", limit: 25, start: 1 }
- "list cas tables in Public" → { lib: "Public", server: "cas", start: 1, limit: 10 }

EXAMPLES
- "list tables in Samples" → { lib: "Samples", start: 1, limit: 10 }
- "show 25 tables in sashelp" → { lib: "sashelp", limit: 25, start: 1 }

NEGATIVE EXAMPLES (do not route here)
- "list libs" (use list-libraries)
- "find lib Public" (use find-library)
- "describe table cars" (use table-info)
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
      lib: z.string().min(1),
      server: z.enum(['cas', 'sas']).optional(),
      limit: z.number().int().min(1).optional(),
      start: z.number().int().min(1).optional(),
      where: z.string().min(1).optional()
    }),
    handler: async (params) => { 
      let r = await _listTables(params);
      return r;
    }
  }
  return spec;
}

export default listTables;

