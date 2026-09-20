---
name: pdf-generation
description: >
  Generate a PDF file from data or text already available in the conversation
  (e.g. a tool result, a table, a "stack" of records). Portable across any
  MCP host that can execute Node.js and write files — Claude Code, GitHub
  Copilot coding agent, or similar. No npm install required.
---

# PDF Generation

## When to use this skill

- The user asks to "export as PDF", "save this as a PDF", "generate a PDF report"
  for data or text that is already in the conversation (e.g. output from a
  `sas-score-*` tool, or any other table/record data).
- Not for editing existing PDFs, extracting text from PDFs, or forms — this
  skill only writes new, simple text-based PDFs.

## Prerequisite

This skill requires an execution environment that can run `node` and write a
file to disk (Claude Code, GitHub Copilot's coding agent, a local CLI agent,
etc.). It will **not** work in a chat-only integration with no code execution
or file-write capability (e.g. a plain Teams/Copilot Studio bot with no
plugin action wired up) — for those, the PDF must be produced by an actual
tool/plugin action exposed by the server, not by an instructional skill.

## Method

1. Write the script below to a temp file (e.g. `generate-pdf.js`) — verbatim,
   no `npm install` needed, it only uses Node's built-in `fs`.
2. Shape the data to render into `{ title, sections }`:
   - `title` — string, optional report title.
   - `sections` — array of `{ heading, lines }`:
     - `heading` — becomes a subheading (e.g. a record's `id`).
     - `lines` — array of strings, one per line (e.g. `"name: value"` pairs
       for every other column of that record).
   This maps directly onto the "stack" layout: one subheading per record,
   then `label: value` per remaining field.
3. Run: `node generate-pdf.js <filename.pdf> '<json>'` — pass the JSON as a
   single-quoted argument, or call `generatePdf(data)` programmatically from
   another script and write the returned `Buffer` to disk yourself.
4. The script always writes into the current user's standard **Downloads**
   folder (`os.homedir()/Downloads`), regardless of what path is passed in —
   only the filename portion is used. It creates the folder if missing, and
   falls back to the current working directory (with a warning) if the
   Downloads folder can't be created or written to, e.g. in a restricted
   sandbox with no writable home directory.
5. Tell the user the output file path (or attach/send it, if the host supports
   that).

### Script: `generate-pdf.js`

```js
#!/usr/bin/env node
/**
 * Zero-dependency PDF writer. Node.js built-ins only (fs) - no npm install needed.
 * Renders plain text pages: a title, then a list of sections, each with a heading
 * and a set of "label: value" lines - i.e. the "stack" layout.
 *
 * Usage:
 *   node generate-pdf.js report.pdf '{"title":"Report","sections":[{"heading":"row-1","lines":["name: Foo","status: active"]}]}'
 * Always writes into the current user's standard Downloads folder.
 * Or import generatePdf(data) / resolveDownloadsPath(filename) programmatically.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE_W = 612, PAGE_H = 792; // Letter
const MARGIN = 54;
const FONT_SIZE_TITLE = 16;
const FONT_SIZE_HEADING = 13;
const FONT_SIZE_BODY = 11;
const LINE_HEIGHT = 16;
const MAX_CHARS_PER_LINE = 92; // rough wrap width for Helvetica @ 11pt within margins

function escapePdfText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur ? cur + ' ' : '') + w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

function layout({ title, sections }) {
  const ops = [];
  if (title) {
    ops.push({ text: title, size: FONT_SIZE_TITLE, gapBefore: 0 });
    ops.push({ text: '', size: FONT_SIZE_BODY, gapBefore: 4 });
  }
  for (const section of sections || []) {
    ops.push({ text: section.heading != null ? String(section.heading) : '', size: FONT_SIZE_HEADING, gapBefore: 10 });
    for (const line of section.lines || []) {
      for (const wrapped of wrap(line, MAX_CHARS_PER_LINE)) {
        ops.push({ text: wrapped, size: FONT_SIZE_BODY, gapBefore: 0 });
      }
    }
  }
  return ops;
}

function paginate(ops) {
  const usableHeight = PAGE_H - MARGIN * 2;
  const pages = [];
  let page = [];
  let y = 0;
  for (const op of ops) {
    const advance = op.gapBefore + LINE_HEIGHT;
    if (y + advance > usableHeight && page.length) {
      pages.push(page);
      page = [];
      y = 0;
    }
    y += advance;
    page.push(op);
  }
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

function pageContentStream(page) {
  let y = PAGE_H - MARGIN;
  const chunks = ['BT', `/F1 ${FONT_SIZE_BODY} Tf`];
  let currentSize = null;
  for (const op of page) {
    y -= op.gapBefore;
    if (op.size !== currentSize) {
      chunks.push(`/F1 ${op.size} Tf`);
      currentSize = op.size;
    }
    chunks.push(`1 0 0 1 ${MARGIN} ${y.toFixed(2)} Tm`);
    chunks.push(`(${escapePdfText(op.text)}) Tj`);
    y -= LINE_HEIGHT;
  }
  chunks.push('ET');
  return chunks.join('\n');
}

function generatePdf(data) {
  const pages = paginate(layout(data));

  const objects = [];
  const fontObjNum = 1;
  objects[0] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  const pageObjNums = [];
  const contentObjNums = [];
  let nextObjNum = 2;

  const pagesObjNum = nextObjNum++;
  for (let i = 0; i < pages.length; i++) {
    pageObjNums.push(nextObjNum++);
    contentObjNums.push(nextObjNum++);
  }
  const catalogObjNum = nextObjNum++;

  objects[pagesObjNum - 1] = `<< /Type /Pages /Kids [${pageObjNums.map(n => n + ' 0 R').join(' ')}] /Count ${pages.length} >>`;

  pages.forEach((page, i) => {
    const stream = pageContentStream(page);
    objects[pageObjNums[i] - 1] =
      `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNums[i]} 0 R >>`;
    objects[contentObjNums[i] - 1] = { stream };
  });

  objects[catalogObjNum - 1] = `<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`;

  let out = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(out.length);
    const objNum = i + 1;
    const body = objects[i];
    if (body && typeof body === 'object' && 'stream' in body) {
      const streamBytes = Buffer.byteLength(body.stream, 'utf8');
      out += `${objNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${body.stream}\nendstream\nendobj\n`;
    } else {
      out += `${objNum} 0 obj\n${body}\nendobj\n`;
    }
  }

  const xrefOffset = out.length;
  const total = objects.length + 1;
  out += `xref\n0 ${total}\n`;
  out += '0000000000 65535 f \n';
  for (let i = 1; i < total; i++) {
    out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  out += `trailer\n<< /Size ${total} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(out, 'utf8');
}

/**
 * Resolve a filename to a path inside the user's standard Downloads folder,
 * creating the folder if it doesn't exist yet. Falls back to the current
 * working directory if the Downloads folder can't be created/written to
 * (e.g. a restricted sandbox with no writable home directory).
 */
function resolveDownloadsPath(filename) {
  const base = path.basename(filename); // ignore any directory the caller passed in
  const downloads = path.join(os.homedir(), 'Downloads');
  try {
    fs.mkdirSync(downloads, { recursive: true });
    fs.accessSync(downloads, fs.constants.W_OK);
    return path.join(downloads, base);
  } catch (err) {
    console.error(`[warn] Downloads folder unavailable (${err.message}), writing to current directory instead`);
    return path.join(process.cwd(), base);
  }
}

if (require.main === module) {
  const [, , outName, jsonArg] = process.argv;
  if (!outName || !jsonArg) {
    console.error('Usage: node generate-pdf.js <filename.pdf> \'<json: {title, sections:[{heading, lines:[]}]}>\'');
    console.error('The file is always written into the standard Downloads folder.');
    process.exit(1);
  }
  const data = JSON.parse(jsonArg);
  const outPath = resolveDownloadsPath(outName);
  fs.writeFileSync(outPath, generatePdf(data));
  console.error(`Wrote ${outPath}`);
}

module.exports = { generatePdf, resolveDownloadsPath };
```

## Example

Converting the "stack" shape from a `list-libraries` / `list-tables` style
result (`{ columns, rows }`, `id` column as heading):

```js
const { generatePdf, resolveDownloadsPath } = require('./generate-pdf.js');
const fs = require('fs');

function toSections(columns, rows) {
  const idIdx = columns.findIndex(c => c.toLowerCase() === 'id');
  const otherCols = columns.filter((_, i) => i !== idIdx);
  return rows.map(row => ({
    heading: idIdx >= 0 ? row[idIdx] : undefined,
    lines: otherCols.map(col => `${col}: ${row[columns.indexOf(col)]}`)
  }));
}

fs.writeFileSync(resolveDownloadsPath('report.pdf'), generatePdf({
  title: 'Library Report',
  sections: toSections(columnTitles, rows)
}));
```

## Limits

- Text only (Helvetica, three fixed sizes) — no images, no tables with ruled
  lines, no custom fonts. Good enough for a readable record/report dump; not
  a design tool.
- If richer styling is needed (multi-column tables, branding, charts), use a
  real PDF library (e.g. `pdfkit`) where `npm install` is available instead
  of this hand-rolled writer.
