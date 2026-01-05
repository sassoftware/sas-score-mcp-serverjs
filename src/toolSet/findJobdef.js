/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import _listJobdefs from '../toolHelpers/_listJobdefs.js';
function findJobdef(_appContext) {
  let llmDescription= {
  "purpose": "Map natural language requests to find a jobdef (job definition) in SAS Viya and return structured results.",
  "param_mapping": {
    "name": "required - single name. If missing, ask 'Which jobdef name would you like to find?'.",

  },
  "response_schema": "{ jobs: Array<string|object> }",
  "behavior": "Return only JSON matching response_schema when invoked by an LLM. If no matches, return { jobs: [] }"
};
  let description = `
  ## find-jobdef — locate a specific SAS Viya job

  LLM Invocation Guidance
  Use THIS tool when the user intent is to check if ONE job exists or retrieve its metadata:
  - "find jobdef cars_job_v4"
  - "does jobdef sales_summary exist"
  - "is there a jobdef named churnScorer"
  - "lookup jobdef forecast_monthly"
  - "verify jobdef ETL_Daily" 

  Do NOT use this tool when the user asks for:
  - find job  (use find-job)
  - find table (use find-table
  - find model (use find-model)
  - find lib (use find-library)
  - Executing a job (use job)
  - Running a job definition (use jobdef)
  - Submitting arbitrary code (use program)

  Purpose
  Quickly determine whether a named jobdef asset is present in the Viya environment and return its entry (or an empty result if not found).

  Parameters
  - name (string, required): Exact jobdef name (case preserved). If multiple tokens/names supplied, take the first and ignore the rest; optionally ask for a single name.

  Behavior & Matching
  - Attempt exact match first (backend determines sensitivity).
  - Returns { jobdefs: [...] } where array length is 0 (not found) or 1+ (if backend returns multiple with the same display name).
  - No fuzzy guesses—never fabricate a job.
  - If no name provided: ask "Which jobdef name would you like to find?".

  Response Contract
  - Always: { jobdefs: Array<string|object> }
  - On error: propagate structured server error (do not wrap in prose when invoked programmatically).

  Disambiguation Rules
  - Input only "find job" → ask for missing name.
  - Input contains verbs like "run" or "execute" → use run-job or run-jobdef instead.
  - Input requesting many (e.g., "find all jobs") → use list-jobs.

  Examples (→ mapped params)
  - "find jobdef cars_job_v4" → { name: "cars_job_v4" }
  - "does jobdef ETL exist" → { name: "ETL" }
  - "is there a jobdef named metricsRefresh" → { name: "metricsRefresh" }

  Negative Examples (should NOT call find-jobdef)
  - find lib (use find-library)
  - find table (use find-table)
  - find model (use find-model)
  - "list job" (list-jobdefs)
  - "run job cars_job_v4" (run-job)
  - "execute jobdef cars_job_v4" (run-jobdef)

  Clarifying Question Template
  - Missing name: "Which jobdef name would you like to find?"
  - Multiple names: "Please provide just one jobdef name (e.g. 'cars_job_v4')."

  Notes
  - For bulk existence checks loop over names and call find-jobdef per name.
  - Combine with run-jobdef tool if user wants to execute after confirming existence.
  `;

  let spec = {
    name: 'find-jobdef',
    aliases: ['findJobdef','find jobdef','find_jobdef'],
    description: description,
    schema: {
      name: z.string()
    },
    required: ['name'],
    handler: async (params) => {
      let r = await _listJobdefs(params);
      return r;
    }
  }
  return spec;
}
export default findJobdef;
