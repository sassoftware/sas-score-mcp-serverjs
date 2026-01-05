/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function listJobdefs(_appContext) {

  let description = `
  ## list-jobdefs — enumerate SAS Viya job definitions assets(jobdefs)

  LLM Invocation Guidance (When to use)
  jobdef and jobdefs are used interchangeably here to refer to job definitions.
  Use THIS tool when the user wants to browse or list many job definitions assets
  - "list jobdefs"
  - "show jobdefs"
  - "list available jobdefs"
  - "browse jobdefs"
  - "next jobdefs" (after a previous page)
  - "list 25 jobdefs" / "list jobdefs limit 25"
  Do NOT use this tool for:
  - Checking existence of ONE job (use find-job)
  - Executing/running a job (use run-job)
  - Running a job definition (use run-jobdef)
  - Submitting SAS code (use run-sas-program)


  Purpose
  Page through jobdef assets deployed/registered in SAS Viya.

  Parameters
  - limit (number, default 10): Number of jobs to return.
  - start (number, default 1): 1-based offset for paging.
  - where (string, optional): Filter expression (future use / passthrough; empty string by default). If unsupported, it may be ignored gracefully.

  Response Contract
  - Returns an array of jobdef names or objects (backend-dependent) inside structuredContent.
  - If items.length === limit, caller may request next page using start + limit.
  - Provide optional hint start = start + limit when page might continue.

  Pagination Examples
  - First page: { start:1, limit:10 }
  - Next page:  { start:11, limit:10 }

  Disambiguation & Clarification
  - Input only "list" → ask: "Specify asset to list? (Say 'Please specify what to listlist' to proceed)" unless prior context indicates job definition listing.
  - Input contains "run"/"execute" plus job name → route to job/jobdef.

  Negative Examples (should NOT call list-jobdefs)
  - "list libraries" (use list-libraries)
  - "list tables" (use list-tables)
  - "list models" (use list-models)
  - "list jobs" (use list-jobs)
  - "find job abc" (findJob)
  - "run job abc" (job)
  - "job abc" (job)
  - "find model xyz" (findModel)
  - "list models" (listModels)
  - "list tables in lib xyz" (listTables)
  - "show me libraries" (listLibraries)
  - "describe job abc" (findJob then possibly job for execution)

  Error Handling
  - On backend error: surface structured error payload (do not fabricate job names).
  - Empty page (items.length === 0) with start > 1 may mean caller paged past end.

  Usage Tips
  - Increase limit for fewer round trips; keep reasonable to avoid large payloads.
  - Combine with findJobdeffor confirmation before execution.

  Examples (→ mapped params)
  - "list jobdefs" → { start:1, limit:10 }
  - "list 25 jobdefs" → { start:1, limit:25 }
  - "next jobdefs" (after prior {start:1,limit:10}) → { start:11, limit:10 }
  `;

  let spec = {
    name: 'list-jobdefs',
    aliases: ['listJobdefs','list jobdefs','list_jobdefs'],
    description: description,
    schema: {
      limit: z.number().default(10),
      start: z.number().default(1),
      where: z.string().default('')
    },
  // No 'server' required; backend context is implicit in helper
  required: [],
    handler: async (params) => {
      // _listJobdefs handles all validation and defaults
      const result = await _listJobdefs(params);
      return result;
    }
  }
  return spec;
}
export default listJobdefs;
