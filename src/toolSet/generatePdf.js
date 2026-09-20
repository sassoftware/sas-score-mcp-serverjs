/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import _generatePdf from '../toolHelpers/_generatePdf.js';

function generatePdf(_appContext) {
  const isAgent = _appContext && _appContext.agent;
  let description = isAgent ? `
generate-pdf — render data already in context into a PDF file.
PARAMS: title (string, optional), columns (string[]), rows (array[]), sections ([{heading, lines[]}]), filename (string, optional), layout ('table'|'stack', optional), orientation ('portrait'|'landscape', optional)
Provide "columns"+"rows" for a real grid table (default), or "sections" directly for a stacked heading/label-value layout. Pass layout:'stack' to force the stacked layout from columns+rows instead (an "id" column becomes each section's heading).
RETURNS: an embedded PDF resource (base64) plus a text summary; also attempts to save the file to the server process's Downloads folder (path included in the summary) as a convenience for local/stdio deployments
` : `
generate-pdf — turn data or results already in the conversation into a downloadable PDF report.

USE when: user asks to "export as PDF", "save this as a PDF", "generate a PDF report" for data/results already available (e.g. output from a list/read/query tool).
DO NOT USE for: editing existing PDFs, extracting text from PDFs, filling PDF forms — this tool only creates new, simple reports.

PARAMETERS
- title: optional string — report title, shown at the top of the PDF.
- columns / rows: the { columns, rows } shape returned by list/query tools. By default this renders as a real grid table — header row, auto-sized columns, zebra striping, and a repeated header across page breaks. Columns auto-scale to fit the page width; if a row's value doesn't fit its column it is truncated with an ellipsis rather than wrapped, so rows stay aligned. Tables with more than 6 columns automatically switch to landscape and a smaller font.
- sections: alternative to columns/rows — array of { heading, lines: string[] }. One entry per record; heading becomes a subheading, lines render one per line underneath (e.g. "name: value" pairs, wrapped in full — no truncation). Always used when provided directly, regardless of "layout".
- layout: optional 'table' (default, requires columns+rows) | 'stack' — pass 'stack' to render columns+rows as headed sections instead of a grid (better when values are long/free text that shouldn't be truncated).
- orientation: optional 'portrait' | 'landscape' — overrides the automatic choice for table layout.
- filename: optional string — base filename for the PDF (".pdf" is appended if missing). Defaults to "report.pdf".

Provide either "sections", or both "columns" and "rows" — not neither.

RETURNS
The PDF is returned inline as a base64-encoded resource (mimeType application/pdf) in the tool result, plus a short text summary. It also attempts to save a copy to the server process's standard Downloads folder (created if missing) and reports the saved path in the summary; this only lands on the requesting user's machine when the server runs locally (e.g. stdio). If Downloads isn't writable (e.g. a remote/stateless HTTP deployment), the save is skipped and the summary says so — use the embedded resource in that case.
`;

  let spec = {
    name: 'generate-pdf',
    description: description,
    inputSchema: z.object({
      title: z.string().optional(),
      sections: z.array(z.object({
        heading: z.union([z.string(), z.number()]).optional(),
        lines: z.array(z.string()).optional()
      })).optional(),
      columns: z.array(z.string()).optional(),
      rows: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).optional(),
      filename: z.string().optional(),
      layout: z.enum(['table', 'stack']).optional(),
      orientation: z.enum(['portrait', 'landscape']).optional()
    }),
    handler: async (params) => {
      let r = await _generatePdf(params);
      return r;
    }
  };
  return spec;
}

export default generatePdf;
