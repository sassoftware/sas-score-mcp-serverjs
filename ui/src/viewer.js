/**
 * UI for the tool results. Layout of an MCP App UI:
 *   ui/index.html      static shell (+ <script type="module" src="/src/viewer.js">)
 *   ui/src/global.css  host style-variable fallbacks (from the SDK template)
 *   ui/src/styles.css  viewer styles
 *   ui/src/viewer.js   this file: connects to the host, renders results
 * `npm run build:ui` bundles all of it into dist/ui/index.html.
 */
import { App, applyDocumentTheme, applyHostFonts, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import './global.css';
import './styles.css';

const mainEl = document.getElementById('main');
const statusEl = document.getElementById('status');
const contentEl = document.getElementById('content');

const el = (tag, text, cls) => {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text; // textContent, never innerHTML: results are untrusted
    if (cls) e.className = cls;
    return e;
};
const fmt = (v) => (v === null ? '' : String(v));

function renderTable({ columns, rows }) {
    const table = el('table');
    const headRow = el('tr');
    columns.forEach((c) => headRow.append(el('th', c)));
    table.appendChild(el('thead')).append(headRow);
    const body = table.appendChild(el('tbody'));
    for (const row of rows) {
        const tr = body.appendChild(el('tr'));
        row.forEach((v) => tr.append(el('td', fmt(v), typeof v === 'number' ? 'num' : undefined)));
    }
    return table;
}

function renderList({ columns, rows, group = [] }) {
    const groupIdx = group.map((g) => columns.indexOf(g)).filter((i) => i >= 0);
    const itemIdx = columns.map((_, i) => i).filter((i) => !groupIdx.includes(i));
    const groups = new Map(); // Map keeps first-seen order
    for (const row of rows) {
        const key = groupIdx.map((i) => fmt(row[i])).join(' / ');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
    }
    const root = el('div');
    for (const [key, groupRows] of groups) {
        if (groupIdx.length) root.append(el('h3', key));
        const ul = root.appendChild(el('ul'));
        for (const row of groupRows) {
            for (const i of itemIdx) {
                const text = itemIdx.length === 1 ? fmt(row[i]) : `${columns[i]}: ${fmt(row[i])}`;
                ul.append(el('li', text));
            }
        }
    }
    return root;
}

// One two-column table (column name | value) per row, with no column titles. The values of the
// `group` columns form an h2 header that spans both columns; those columns are left out of the
// body. Two blank lines follow each table, and the whole output scrolls inside one div.
function renderSubTables({ columns, rows, group = [] }) {
    const groupIdx = group.map((name) => columns.indexOf(name)).filter((index) => index >= 0);
    const itemIdx = columns.map((_, index) => index).filter((index) => !groupIdx.includes(index));
    const root = el('div', undefined, 'scroll-box');

    for (const row of rows) {
        const title = groupIdx.length ? groupIdx.map((index) => fmt(row[index])).join(' / ') : 'Ungrouped';
        root.append(el('h2', title));

        const table = root.appendChild(el('table', undefined, 'subtable'));
        const body = table.appendChild(el('tbody'));
        for (const index of itemIdx) {
            body.appendChild(el('tr')).append(el('td', columns[index]), el('td', fmt(row[index])));
        }

        root.append(el('div', undefined, 'blank-line'), el('div', undefined, 'blank-line'));
    }
    return root;
}

function renderDetails({ columns, rows, group = [] }) {
    const groupIdx = group.map((name) => columns.indexOf(name)).filter((index) => index >= 0);
    const itemIdx = columns.map((_, index) => index).filter((index) => !groupIdx.includes(index));
    const root = el('div', undefined, 'scroll-box');

    for (const row of rows) {
        const title = groupIdx.length ? groupIdx.map((index) => fmt(row[index])).join(' / ') : 'Ungrouped';
        const details = root.appendChild(el('details'));
        details.append(el('summary', title));

        const table = details.appendChild(el('table', undefined, 'subtable'));
        const body = table.appendChild(el('tbody'));
        for (const index of itemIdx) {
            body.appendChild(el('tr')).append(el('td', columns[index]), el('td', fmt(row[index])));
        }
    }
    return root;
}
function renderSections({ columns, rows, group = [] }) {
    const groupIdx = group.map((name) => columns.indexOf(name)).filter((index) => index >= 0);
    const itemIdx = columns.map((_, index) => index).filter((index) => !groupIdx.includes(index));
    const root = el('div', undefined, 'scroll-box');

    for (const row of rows) {
        const title = groupIdx.length ? groupIdx.map((index) => fmt(row[index])).join(' / ') : 'Ungrouped';
        const section = root.appendChild(el('section'));
        section.append(el('h2', title));

        const table = section.appendChild(el('table', undefined, 'subtable'));
        const body = table.appendChild(el('tbody'));
        for (const index of itemIdx) {
            body.appendChild(el('tr')).append(el('td', columns[index]), el('td', fmt(row[index])));
        }
    }
    return root;
}

function renderRaw(result) {
    const pre = el('pre', JSON.stringify(result, null, 2));
    return pre;
}

function render(result) {
    statusEl.hidden = true;
    const viewer = result.viewHint?.toLowerCase();
    console.error('------------------------Viewer type:', viewer);
    contentEl.replaceChildren(
        viewer === 'list'
            ? renderList(result)
            : viewer === 'group'
                ? renderSubTables(result)
                : viewer === 'details'
                    ? renderDetails(result)
                    : viewer === 'section'
                        ? renderSections(result)
                        : viewer === 'table'
                            ? renderTable(result)
                            : renderRaw(result),
    );
}

// The iframe auto-resizes to its content, so `vh` units inside it are circular (a short iframe
// makes a short box). Size the scroll box in pixels from what the host says it can give us.
const FALLBACK_BOX_HEIGHT = 800;
function sizeScrollBox(ctx) {
    const root = document.documentElement.style;
    if (ctx?.displayMode === 'fullscreen') {
        // The host gives a fullscreen view the whole panel, so vh is meaningful here.
        root.setProperty('--box-h', 'calc(100vh - 70px)');
        return;
    }
    const d = ctx?.containerDimensions;
    const h = d?.height ?? d?.maxHeight ?? FALLBACK_BOX_HEIGHT;
    root.setProperty('--box-h', `${Math.max(h, FALLBACK_BOX_HEIGHT)}px`);
}

// Expand / Collapse button: only offered when the host supports fullscreen.
const expandBtn = el('button', 'Expand', 'expand-btn');
expandBtn.hidden = true;
expandBtn.type = 'button';
mainEl.prepend(expandBtn);
let displayMode = 'inline';
function updateExpandButton(ctx) {
    if (ctx?.displayMode) displayMode = ctx.displayMode;
    const available = ctx?.availableDisplayModes ?? app.getHostContext()?.availableDisplayModes;
    expandBtn.hidden = !available?.includes('fullscreen');
    expandBtn.textContent = displayMode === 'fullscreen' ? 'Collapse' : 'Expand';
}
expandBtn.addEventListener('click', async () => {
    const mode = displayMode === 'fullscreen' ? 'inline' : 'fullscreen';
    try {
        const res = await app.requestDisplayMode({ mode });
        displayMode = res.mode;
        const ctx = app.getHostContext();
        sizeScrollBox({ ...ctx, displayMode });
        updateExpandButton({ ...ctx, displayMode });
    } catch (e) {
        console.error('requestDisplayMode failed', e);
    }
});

function onHostContext(ctx) {
    sizeScrollBox(ctx);
    updateExpandButton(ctx);
    if (ctx.theme) applyDocumentTheme(ctx.theme);
    if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
    if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
    if (ctx.safeAreaInsets) {
        const { top, right, bottom, left } = ctx.safeAreaInsets;
        mainEl.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }
}

const app = new App({ name: 'Results Viewer', version: '1.0.0' });

// Register ALL handlers before connect()
app.ontoolresult = (result) => {
    const data = result.structuredContent;
    if (data?.columns && data.rows) render(data);
    else if (data) {
        // Detail/lookup tools return a plain object: show it as-is.
        statusEl.hidden = true;
        contentEl.replaceChildren(renderRaw(data));
    } else {
        statusEl.hidden = false;
        statusEl.textContent = 'No structured data in tool result.';
    }
};
app.onhostcontextchanged = onHostContext;
app.onteardown = async () => ({});
app.onerror = console.error;

app.connect().then(() => {
    const ctx = app.getHostContext();
    if (ctx) onHostContext(ctx);
    else sizeScrollBox(null);
});
