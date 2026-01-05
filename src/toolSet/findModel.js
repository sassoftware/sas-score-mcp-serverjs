/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _listModels from '../toolHelpers/_listModels.js';


function findModel(_appContext) {
  let description = `
  ## find-model — locate a specific model deployed to MAS (Model Publish / Scoring service)

  LLM Invocation Guidance (When to use)
  Use THIS tool when the user wants to know whether ONE model exists or is deployed:
  - "find model cancerRisk"
  - "does model churn_tree exist"
  - "is model sales_forecast deployed"
  - "lookup model claimFraud"
  - "verify model credit_score_v2 exists"

  Do NOT use this tool for:
  - Listing many / browsing models (use list-models)
  - Retrieving detailed input/output variable metadata (use model-info)
  - Scoring or running a model (use model-score)
  - Searching model execution containers or SCR endpoints (use scr-info / scr-score if appropriate)
  - Finding a table (use find-table)
  - Finding a library (use find-library)
  - Finding a job or jobdef (use find-job / find-jobdef)

  Purpose
  Quick existence / lookup check for a MAS‑published model. Returns a list with zero or more matches (typically 0 or 1 for an exact name).

  Parameters
  - name (string, required): Exact model name. If user supplies phrases like "model named X" extract X. If multiple names are given (comma or space separated), prefer the first and (optionally) ask for a single name.

  Matching Rules
  - Attempt exact match first. If backend supports partial search, a substring match MAY return multiple models; preserve order.
  - Do not fabricate models. Empty array means not found.

  Response Contract
  - Always: { models: Array<object|string> }
  - Never return prose when invoked programmatically; only the JSON structure.
  - On error: surface backend error object directly (no rewriting) so the caller can display/log it.

  Disambiguation & Clarification
  - Missing name (e.g., "find model") → ask: "Which model name would you like to find?"
  - Plural intent (e.g., "find models" / "list models") → use list-models instead.
  - If user requests scoring ("score model X") → route to model-score not find-model.

  Examples (→ mapped params)
  - "find model myModel" → { name: "myModel" }
  - "does model churn_score exist" → { name: "churn_score" }
  - "is model riskModel deployed" → { name: "riskModel" }
  - "lookup model claims_fraud_v1" → { name: "claims_fraud_v1" }

  Negative Examples (should NOT call find-model)
  - "list models" (list-models)
  - "score model myModel" (model-score)
  - "describe model myModel" (model-info)

  Notes
  - Chain usage: find-model → model-info → model-score.
  - For batch existence checks iterate over a list and call find-model per entry.
  `;

  let spec = {
    name: 'find-model',
    aliases: ['findModel','find model','find_model'],
    description: description,
    schema: {
      'name': z.string()
    },
    required: ['name'],
    handler: async (params) => { 
      let r = await _listModels(params);
      return r;
    }
  }
  return spec;
}

export default findModel;
