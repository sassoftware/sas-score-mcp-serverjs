/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import os from 'os';
import path from 'path';

const CELL_PADDING = 4;
const MIN_COL_WIDTH = 40;
const HEADER_FILL = '#e2e2e2';
const ZEBRA_FILL = '#f5f5f5';
const ROW_BORDER = '#dddddd';
const HEADER_BORDER = '#999999';

function toSections(columns, rows) {
  const idIdx = columns.findIndex((c) => String(c).toLowerCase() === 'id');
  const otherCols = columns.filter((_, i) => i !== idIdx);
  return rows.map((row) => ({
    heading: idIdx >= 0 ? row[idIdx] : undefined,
    lines: otherCols.map((col) => `${col}: ${row[columns.indexOf(col)]}`)
  }));
}

function buildSectionsPdf({ title, sections }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (title) {
      doc.fontSize(18).text(title);
      doc.moveDown();
    }
    for (const section of sections) {
      if (section.heading != null) {
        doc.fontSize(13).text(String(section.heading));
      }
      doc.fontSize(11);
      for (const line of section.lines || []) {
        doc.text(String(line));
      }
      doc.moveDown();
    }
    doc.end();
  });
}

// Natural width of each column (widest of header/cell text), scaled to fit the
// available page width; never shrinks a column below MIN_COL_WIDTH, so very
// wide tables rely on per-cell ellipsis truncation rather than unreadable columns.
function computeColumnWidths(doc, columns, rows, availableWidth, fontSize) {
  doc.font('Helvetica').fontSize(fontSize);
  const natural = columns.map((col, i) => {
    let max = doc.widthOfString(String(col));
    for (const row of rows) {
      const v = row[i];
      const w = doc.widthOfString(v == null ? '' : String(v));
      if (w > max) max = w;
    }
    return max + CELL_PADDING * 2;
  });
  const total = natural.reduce((a, b) => a + b, 0);
  if (total === 0) return natural.map(() => availableWidth / columns.length);
  if (total <= availableWidth) {
    const extra = availableWidth - total;
    return natural.map((w) => w + (extra * w) / total);
  }
  const scale = availableWidth / total;
  return natural.map((w) => Math.max(w * scale, MIN_COL_WIDTH));
}

function drawRow(doc, { x, y, height, widths, values, fontSize, bold, fill }) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  if (fill) {
    doc.rect(x, y, totalWidth, height).fill(fill);
  }
  doc.fillColor('black').font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize);
  let cx = x;
  values.forEach((val, i) => {
    const isNumber = typeof val === 'number';
    doc.text(val == null ? '' : String(val), cx + CELL_PADDING, y + (height - fontSize) / 2, {
      width: widths[i] - CELL_PADDING * 2,
      height,
      ellipsis: true,
      lineBreak: false,
      align: isNumber ? 'right' : 'left'
    });
    cx += widths[i];
  });
}

// Renders columns/rows as a real grid table: sized/auto-scaled columns, a
// repeated header on page breaks, zebra striping and row separators. Cells
// are single-line with ellipsis truncation rather than wrapping, so rows stay
// aligned; very wide tables auto-switch to landscape and a smaller font.
function buildTablePdf({ title, columns, rows, orientation }) {
  return new Promise((resolve, reject) => {
    const pageLayout = orientation || (columns.length > 6 ? 'landscape' : 'portrait');
    const doc = new PDFDocument({ margin: 40, layout: pageLayout, size: 'LETTER' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const marginLeft = doc.page.margins.left;
    const marginTop = doc.page.margins.top;
    const availableWidth = doc.page.width - marginLeft - doc.page.margins.right;
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    let fontSize = 9;
    if (columns.length > 10) fontSize = 7;
    else if (columns.length > 6) fontSize = 8;

    const widths = computeColumnWidths(doc, columns, rows, availableWidth, fontSize);
    const rowHeight = fontSize + CELL_PADDING * 2 + 2;

    let y = marginTop;
    if (title) {
      doc.font('Helvetica-Bold').fontSize(16).fillColor('black').text(title, marginLeft, y);
      y = doc.y + 12;
    }

    function drawHeader() {
      drawRow(doc, { x: marginLeft, y, height: rowHeight, widths, values: columns, fontSize, bold: true, fill: HEADER_FILL });
      doc.moveTo(marginLeft, y + rowHeight).lineTo(marginLeft + availableWidth, y + rowHeight)
        .strokeColor(HEADER_BORDER).lineWidth(1).stroke();
      y += rowHeight;
    }

    drawHeader();

    rows.forEach((row, i) => {
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = marginTop;
        drawHeader();
      }
      drawRow(doc, { x: marginLeft, y, height: rowHeight, widths, values: row, fontSize, bold: false, fill: i % 2 === 1 ? ZEBRA_FILL : null });
      doc.moveTo(marginLeft, y + rowHeight).lineTo(marginLeft + availableWidth, y + rowHeight)
        .strokeColor(ROW_BORDER).lineWidth(0.5).stroke();
      y += rowHeight;
    });

    doc.end();
  });
}

// Resolve a filename to a path inside the server process's standard Downloads
// folder, creating it if needed. Only meaningful when the server runs on the
// same machine as the requesting user (e.g. a local stdio server) - falls
// back to the current working directory if Downloads can't be created or
// written to (e.g. a remote/stateless HTTP deployment with no usable home
// directory), in which case the caller should rely on the returned blob
// instead of the on-disk copy.
function resolveDownloadsPath(filename) {
  const downloads = path.join(os.homedir(), 'Downloads');
  try {
    fs.mkdirSync(downloads, { recursive: true });
    fs.accessSync(downloads, fs.constants.W_OK);
    return path.join(downloads, filename);
  } catch {
    return path.join(process.cwd(), filename);
  }
}

async function _generatePdf(params) {
  const { title, sections, columns, rows, filename, layout, orientation } = params;

  try {
    const wantsTable = sections == null && columns != null && rows != null && layout !== 'stack';

    let buffer;
    let unitCount;
    if (wantsTable) {
      buffer = await buildTablePdf({ title, columns, rows, orientation });
      unitCount = rows.length;
    } else {
      const resolvedSections = sections != null
        ? sections
        : (columns != null && rows != null ? toSections(columns, rows) : null);

      if (resolvedSections == null) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'generate-pdf requires either "sections" or both "columns" and "rows".' }]
        };
      }
      buffer = await buildSectionsPdf({ title, sections: resolvedSections });
      unitCount = resolvedSections.length;
    }

    const name = filename && filename.trim() ? filename.trim() : 'report.pdf';
    const outName = name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
    const unitLabel = wantsTable ? 'row' : 'section';

    let savedPath = null;
    try {
      savedPath = resolveDownloadsPath(outName);
      fs.writeFileSync(savedPath, buffer);
    } catch (writeErr) {
      console.error(`[warn] generate-pdf could not save to disk: ${writeErr.message}`);
      savedPath = null;
    }

    const summary = savedPath
      ? `Generated "${outName}" (${buffer.length} bytes, ${unitCount} ${unitLabel}(s), layout: ${wantsTable ? 'table' : 'stack'}). Saved to ${savedPath}.`
      : `Generated "${outName}" (${buffer.length} bytes, ${unitCount} ${unitLabel}(s), layout: ${wantsTable ? 'table' : 'stack'}). Could not save to disk; use the embedded resource instead.`;

    return {
      content: [
        { type: 'text', text: summary },
        {
          type: 'resource',
          resource: {
            uri: savedPath ? `file:///${savedPath.replace(/\\/g, '/')}` : `file:///${outName}`,
            mimeType: 'application/pdf',
            blob: buffer.toString('base64')
          }
        }
      ]
    };
  } catch (err) {
    console.error(JSON.stringify(err));
    return { isError: true, content: [{ type: 'text', text: (typeof err === 'string') ? err : (err.message || JSON.stringify(err)) }] };
  }
}

export default _generatePdf;
