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

USE when: list tables in <lib>, show tables in <lib>, next page
DO NOT USE for: find table, list libraries, get table structure (use ${_appContext.brand}-table-info), read data (use ${_appContext.brand}-read-table)

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
-- "list libs" (use ${_appContext.brand}-list-libraries)
-- "find lib Public" (use ${_appContext.brand}-find-library)
-- "describe table cars" (use ${_appContext.brand}-table-info)
-- "read table cars" (use ${_appContext.brand}-read-table)

ERRORS
Returns empty array if no tables found.
  `;
    
  let spec = {
    name: 'list-tables',
    description: description,

    inputSchema: z.object({
      lib: z.string(),
      server: z.string().optional(),
      limit: z.number().optional(),
      start: z.number().optional(),
      where: z.string().optional()
    }),
    handler: async (params) => { 
      let r = await _listTables(params);
      return r;
    }
  }
  return spec;
}

export default listTables;

