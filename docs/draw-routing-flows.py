#!/usr/bin/env python3
"""
draw-routing-flows.py
Generates one PNG per routing flow:
  flow-find.png | flow-list.png | flow-read.png | flow-score.png | flow-describe.png
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# ── Palette ────────────────────────────────────────────────────────────────────
BG       = '#FFFFFF'
BOX      = '#F2F2F2'
BOX_DARK = '#E8E8E8'
BORDER   = '#CCCCCC'
TEXT     = '#111111'
TEXT_DIM = '#555555'
ARROW    = '#888888'

FIND_C   = '#005B99'
LIST_C   = '#1144BB'
READ_C   = '#116633'
SCORE_C  = '#5511AA'
DESC_C   = '#AA5500'
SHARED_C = '#AA0044'
SKIP_C   = '#AA1111'
MERGE_C  = '#115566'


# ── Shared drawing helpers ─────────────────────────────────────────────────────
def rbox(ax, cx, cy, w, h, text, bg=BOX, fg=TEXT, fs=9, bold=False,
         lw=0.8, ec=BORDER, radius=0.12, zorder=3, alpha=1.0, ls=1.35):
    rect = FancyBboxPatch(
        (cx - w/2, cy - h/2), w, h,
        boxstyle=f"round,pad=0,rounding_size={radius}",
        linewidth=lw, edgecolor=ec, facecolor=bg, alpha=alpha, zorder=zorder
    )
    ax.add_patch(rect)
    if text:
        ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
                color=fg, fontweight='bold' if bold else 'normal',
                zorder=zorder+1, multialignment='center', linespacing=ls)

def badge(ax, cx, cy, text, fs=8.5):
    w = len(text) * 0.095 + 0.4
    rect = FancyBboxPatch(
        (cx - w/2, cy - 0.20), w, 0.40,
        boxstyle="round,pad=0,rounding_size=0.10",
        linewidth=0.8, edgecolor='#AAAAAA', facecolor=BOX, zorder=4
    )
    ax.add_patch(rect)
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
            color='#222222', family='monospace', zorder=5)

def skill_card(ax, cx, cy, w, h, name, subtitle, accent):
    rbox(ax, cx, cy, w, h, '', BOX_DARK, lw=1.2, ec=accent, radius=0.16, zorder=3)
    bar = FancyBboxPatch(
        (cx - w/2, cy - h/2 + 0.06), 0.20, h - 0.12,
        boxstyle="round,pad=0,rounding_size=0.07",
        linewidth=0, facecolor=accent, zorder=4
    )
    ax.add_patch(bar)
    ax.text(cx + 0.15, cy + h/2 - 0.38,
            f'*{name}', ha='center', va='center',
            fontsize=11, fontweight='bold', color=accent, zorder=5)
    if subtitle:
        ax.text(cx + 0.15, cy - 0.10, subtitle,
                ha='center', va='center', fontsize=8.5, color=TEXT_DIM,
                zorder=5, multialignment='center', linespacing=1.4)

def accent_box(ax, cx, cy, w, h, text, accent, fs=8.5):
    rbox(ax, cx, cy, w, h, '', BOX, lw=0.7, ec=accent+'88', radius=0.10, zorder=3)
    stripe = FancyBboxPatch(
        (cx - w/2, cy - h/2 + 0.04), 0.12, h - 0.08,
        boxstyle="round,pad=0,rounding_size=0.05",
        linewidth=0, facecolor=accent, zorder=4
    )
    ax.add_patch(stripe)
    ax.text(cx + 0.10, cy, text, ha='center', va='center',
            fontsize=fs, color=accent, zorder=5,
            multialignment='center', linespacing=1.35)

def arr(ax, x0, y0, x1, y1, c=ARROW, lw=1.3):
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='->', color=c, lw=lw,
                                connectionstyle='arc3,rad=0.0'), zorder=2)

def tag(ax, cx, cy, text, c=TEXT_DIM, fs=7.8, style='normal'):
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
            color=c, style=style, zorder=6,
            multialignment='center', linespacing=1.3)

def entry_banner(ax, FW, top_y, accent, intent_label):
    """Small 'dispatched from *request-routing' banner at top."""
    rbox(ax, FW/2, top_y, FW - 0.4, 0.70,
         f'*request-routing  →  {intent_label}',
         BOX_DARK, fg=accent, fs=11, bold=True,
         lw=1.4, ec=accent, radius=0.14, zorder=3)

def make_ax(fw, fh):
    fig, ax = plt.subplots(figsize=(fw, fh))
    ax.set_xlim(0, fw)
    ax.set_ylim(0, fh)
    ax.axis('off')
    ax.set_facecolor(BG)
    fig.patch.set_facecolor(BG)
    return fig, ax

def save(fig, name, dpi=150):
    fig.savefig(name, dpi=dpi, bbox_inches='tight',
                facecolor=BG, edgecolor='none')
    plt.close(fig)
    print(f'Saved: {name}')


# ══════════════════════════════════════════════════════════════════════════════
#  FLOW 1 — FIND
# ══════════════════════════════════════════════════════════════════════════════
def draw_find():
    FW, FH = 9.0, 17.5
    fig, ax = make_ax(FW, FH)
    c = FIND_C
    cx = FW / 2

    # Title
    ax.text(cx, FH - 0.40, 'FIND Flow', ha='center', va='center',
            fontsize=16, fontweight='bold', color=TEXT)
    ax.text(cx, FH - 0.90, 'Verify a named resource exists',
            ha='center', va='center', fontsize=9, color=TEXT_DIM, style='italic')

    # Entry banner
    y = FH - 1.50
    entry_banner(ax, FW, y, c, 'FIND')
    arr(ax, cx, y - 0.36, cx, y - 0.82)
    y -= 1.12

    # Skill card
    skill_card(ax, cx, y - 0.55, FW - 0.5, 1.30,
               'find-resources',
               'Verify a named resource exists\nbefore any action',
               SHARED_C)
    arr(ax, cx, y - 0.55 - 0.66, cx, y - 0.55 - 1.10)
    y -= 1.90

    # Parse box
    rbox(ax, cx, y, FW - 0.7, 0.80,
         'Parse  a.b  notation  ·  determine server\n'
         '(CAS known libs / SAS known libs / try cas → sas)',
         fs=9, ls=1.45)
    arr(ax, cx, y - 0.41, cx, y - 0.88)
    y -= 1.20

    # Resource type decision
    rbox(ax, cx, y, FW - 0.7, 0.56,
         'Resource type?', BOX_DARK, fg=c, bold=True, ec=c, fs=10)
    arr(ax, cx, y - 0.29, cx, y - 0.72)
    y -= 1.02

    # Tool rows
    FIND_TOOLS = [
        ('Table',   'find-table',   '(lib, name, server)'),
        ('Library', 'find-library', '(name, server)'),
        ('MAS',     'find-mas',     '(name)'),
        ('Job',     'find-job',     '(name)'),
        ('JobDef',  'find-jobdef',  '(name)'),
        ('SCR',     None,           'no find tool — ask user'),
    ]
    ROW_H = 0.90
    for i, (lbl, tool, note) in enumerate(FIND_TOOLS):
        ty = y - i * ROW_H
        rbox(ax, cx, ty, FW - 0.7, ROW_H - 0.08,
             '', BOX, lw=0.5, ec=BORDER + '88', radius=0.09)
        ax.text(1.0, ty + 0.15, lbl,
                ha='left', va='center', fontsize=9, color=c,
                fontweight='bold', zorder=5)
        if tool:
            badge(ax, cx + 0.5, ty + 0.15, f'sas-score-{tool}')
            tag(ax, cx + 0.5, ty - 0.23, note)
        else:
            tag(ax, cx + 0.3, ty + 0.05, note, c=SKIP_C)

    save(fig, 'flow-find.png')


# ══════════════════════════════════════════════════════════════════════════════
#  FLOW 2 — LIST
# ══════════════════════════════════════════════════════════════════════════════
def draw_list():
    FW, FH = 9.0, 17.5
    fig, ax = make_ax(FW, FH)
    c = LIST_C
    cx = FW / 2

    ax.text(cx, FH - 0.40, 'LIST Flow', ha='center', va='center',
            fontsize=16, fontweight='bold', color=TEXT)
    ax.text(cx, FH - 0.90, 'Browse and discover resources  (not for verification)',
            ha='center', va='center', fontsize=9, color=TEXT_DIM, style='italic')

    y = FH - 1.50
    entry_banner(ax, FW, y, c, 'LIST')
    arr(ax, cx, y - 0.36, cx, y - 0.82)
    y -= 1.12

    skill_card(ax, cx, y - 0.55, FW - 0.5, 1.30,
               'list-resource',
               'Browse / discover resources\n(not for verification)',
               c)
    arr(ax, cx, y - 0.55 - 0.66, cx, y - 0.55 - 1.10)
    y -= 1.90

    rbox(ax, cx, y, FW - 0.7, 0.72,
         'Trigger:  "list", "show all", "browse", "enumerate"',
         fs=9)
    arr(ax, cx, y - 0.37, cx, y - 0.82)
    y -= 1.10

    rbox(ax, cx, y, FW - 0.7, 0.72,
         'Pagination defaults:  start = 1,  limit = 10\n(always pass — never omit)',
         fs=9, ls=1.45)
    arr(ax, cx, y - 0.37, cx, y - 0.82)
    y -= 1.12

    rbox(ax, cx, y, FW - 0.7, 0.56,
         'Resource type?', BOX_DARK, fg=c, bold=True, ec=c, fs=10)
    arr(ax, cx, y - 0.29, cx, y - 0.72)
    y -= 1.02

    LIST_TOOLS = [
        ('Libraries', 'list-libraries', 'server: cas | sas | all'),
        ('Tables',    'list-tables',    'lib, server'),
        ('MAS',       'list-mas',       'start, limit'),
        ('Jobs',      'list-jobs',      'start, limit'),
        ('JobDefs',   'list-jobdefs',   'start, limit'),
        ('SCR',       None,             'no list tool available'),
    ]
    ROW_H = 0.90
    for i, (lbl, tool, note) in enumerate(LIST_TOOLS):
        ty = y - i * ROW_H
        rbox(ax, cx, ty, FW - 0.7, ROW_H - 0.08,
             '', BOX, lw=0.5, ec=BORDER + '88', radius=0.09)
        ax.text(1.0, ty + 0.15, lbl,
                ha='left', va='center', fontsize=9, color=c,
                fontweight='bold', zorder=5)
        if tool:
            badge(ax, cx + 0.5, ty + 0.15, f'sas-score-{tool}')
            tag(ax, cx + 0.5, ty - 0.23, note)
        else:
            tag(ax, cx + 0.3, ty + 0.05, note, c=SKIP_C)

    save(fig, 'flow-list.png')


# ══════════════════════════════════════════════════════════════════════════════
#  FLOW 3 — READ / QUERY
# ══════════════════════════════════════════════════════════════════════════════
def draw_read():
    FW, FH = 10.0, 14.0
    fig, ax = make_ax(FW, FH)
    c = READ_C
    cx = FW / 2

    ax.text(cx, FH - 0.40, 'READ / QUERY Flow', ha='center', va='center',
            fontsize=16, fontweight='bold', color=TEXT)
    ax.text(cx, FH - 0.90, 'Read raw rows or run SQL aggregations from CAS / SAS tables',
            ha='center', va='center', fontsize=9, color=TEXT_DIM, style='italic')

    y = FH - 1.50
    entry_banner(ax, FW, y, c, 'READ / QUERY')
    arr(ax, cx, y - 0.36, cx, y - 0.82)
    y -= 1.12

    skill_card(ax, cx, y - 0.55, FW - 0.5, 1.30,
               'read-strategy',
               'Raw rows vs SQL aggregation\nAlways verify table first',
               c)
    arr(ax, cx, y - 0.55 - 0.66, cx, y - 0.55 - 1.10)
    y -= 1.90

    # Verify step
    accent_box(ax, cx, y, FW - 0.7, 0.72,
               '① *find-resources\nVerify table exists  ·  determine server (CAS or SAS)',
               SHARED_C, fs=9)
    arr(ax, cx, y - 0.37, cx, y - 0.82)
    y -= 1.14

    # Decision diamond
    DW, DH = 2.4, 0.90
    pts = np.array([[cx, y+DH/2], [cx+DW, y], [cx, y-DH/2], [cx-DW, y]])
    ax.fill(pts[:,0], pts[:,1], color=BOX_DARK, zorder=3)
    ax.plot(pts[:,0], pts[:,1], color=c, lw=1.2, zorder=4)
    ax.text(cx, y, 'Aggregation /\nJOIN needed?',
            ha='center', va='center', fontsize=9, color=c,
            fontweight='bold', zorder=5, multialignment='center')
    y -= DH/2

    # Branches
    XL, XR = cx - 2.6, cx + 2.6
    y_br = y - 0.88

    arr(ax, cx - DW, y + DH/2 - 0.45, XL, y_br + 0.22, c=c)
    arr(ax, cx + DW, y + DH/2 - 0.45, XR, y_br + 0.22, c=c)
    tag(ax, XL - 0.2, y + DH/2 - 0.18, 'yes', c=c)
    tag(ax, XR + 0.2, y + DH/2 - 0.18, 'no',  c=c)

    # Left: sas-query
    rbox(ax, XL, y_br, 3.8, 1.70,
         '', BOX, lw=0.7, ec=c+'66', radius=0.12, zorder=3)
    badge(ax, XL, y_br + 0.52, 'sas-score-sas-query', fs=9)
    tag(ax, XL, y_br + 0.10, 'Use for:', c=TEXT_DIM, fs=8)
    tag(ax, XL, y_br - 0.28,
        'COUNT · SUM · AVG\nGROUP BY · JOIN\nCross-table analysis', fs=8)

    # Right: read-table
    rbox(ax, XR, y_br, 3.8, 1.70,
         '', BOX, lw=0.7, ec=c+'66', radius=0.12, zorder=3)
    badge(ax, XR, y_br + 0.52, 'sas-score-read-table', fs=9)
    tag(ax, XR, y_br + 0.10, 'Params:', c=TEXT_DIM, fs=8)
    tag(ax, XR, y_br - 0.28,
        'lib, table, server\nstart, limit\nwhere (optional)', fs=8)

    # Note
    tag(ax, cx, y_br - 1.12,
        'WHERE filter alone  →  use read-table  (not sas-query)',
        c=READ_C, style='italic', fs=8.5)

    save(fig, 'flow-read.png')


# ══════════════════════════════════════════════════════════════════════════════
#  FLOW 4 — SCORE
# ══════════════════════════════════════════════════════════════════════════════
def draw_score():
    FW, FH = 19.0, 22.0
    fig, ax = make_ax(FW, FH)
    c = SCORE_C
    cx = FW / 2

    ax.text(cx, FH - 0.40, 'SCORE Flow', ha='center', va='center',
            fontsize=18, fontweight='bold', color=TEXT)
    ax.text(cx, FH - 0.95,
            'Verify model → score inline inputs  or  read table rows then score each row',
            ha='center', va='center', fontsize=9, color=TEXT_DIM, style='italic')

    y = FH - 1.60
    entry_banner(ax, FW, y, c, 'SCORE')
    arr(ax, cx, y - 0.36, cx, y - 0.85)
    y -= 1.18

    skill_card(ax, cx, y - 0.60, FW - 0.6, 1.55,
               'score-strategy',
               'Verify model exists, then score inputs\n'
               'Exception: Programs skip verify entirely',
               c)
    arr(ax, cx, y - 0.60 - 0.78, cx, y - 0.60 - 1.25)
    y -= 2.15

    # Source decision
    rbox(ax, cx, y, 6.0, 0.66,
         'Source of inputs?', BOX_DARK, fg=c, bold=True, ec=c, fs=11)
    y -= 0.50

    XL, XR = cx - 5.5, cx + 5.5
    BOX_W = 7.8
    arr(ax, cx - 1.6, y, XL, y - 0.62, c=c)
    arr(ax, cx + 1.6, y, XR, y - 0.62, c=c)
    tag(ax, cx - 3.2, y - 0.30, 'inline scenario', c=c, fs=9)
    tag(ax, cx + 3.2, y - 0.30, 'table rows',       c=c, fs=9)
    y -= 0.88

    # ── INLINE PATH ────────────────────────────────────────────────────────────
    yi = y
    accent_box(ax, XL, yi, BOX_W, 0.90,
               '① *find-resources\nVerify model exists\n(skip for SCR & Programs)',
               SHARED_C, fs=10)
    arr(ax, XL, yi - 0.46, XL, yi - 1.05)
    yi -= 1.40

    rbox(ax, XL, yi, BOX_W, 0.60,
         'Model type?', BOX_DARK, fg=c, bold=True, ec=c, fs=11)
    arr(ax, XL, yi - 0.31, XL, yi - 0.78)
    yi -= 1.08

    SCORE_TOOLS = [
        ('MAS',         'mas-score',         'model, scenario',        False),
        ('SCR',         'scr-score',          'name, scenario',         True),
        ('Job',         'job-score',          'name, scenario',         False),
        ('JobDef',      'jobdef-score',       'name, scenario',         False),
        ('Program',     'program-score',      'src, scenario, folder…', True),
        ('CAS Program', 'cas-program-score',  'src, scenario, folder…', True),
        ('Macro',       'macro-score',        'macro, scenario',        True),
    ]
    ROW_H = 1.06
    for i, (lbl, tool, params, skip) in enumerate(SCORE_TOOLS):
        ty = yi - i * ROW_H
        rbox(ax, XL, ty, BOX_W, ROW_H - 0.10,
             '', BOX, lw=0.5, ec=BORDER + '88', radius=0.10)
        fc = SKIP_C if skip else c
        ax.text(XL - BOX_W/2 + 0.55, ty + 0.18, lbl,
                ha='left', va='center', fontsize=10,
                color=fc, fontweight='bold', zorder=5)
        badge(ax, XL + 0.6, ty + 0.18, f'sas-score-{tool}', fs=9.5)
        tag(ax, XL + 0.6, ty - 0.24, params, fs=8.5)

    tag(ax, XL, yi - len(SCORE_TOOLS) * ROW_H - 0.28,
        '✓ = skip verify — direct execute (no find-* needed)',
        c=SKIP_C, style='italic', fs=9)

    # ── TABLE-ROW PATH ─────────────────────────────────────────────────────────
    yt = y
    STEPS = [
        (SHARED_C, '① *find-resources\nVerify model & table\ndetermine server'),
        (READ_C,   '② *read-strategy\nRead rows from table\n(read-table or sas-query)'),
        (c,        '③ Map columns\nAlign table columns to\nmodel input variables'),
        (c,        '④ Score each row\nCall appropriate\nscoring tool per model type'),
        (MERGE_C,  '⑤ Merge & return\nAttach predictions to\noriginal input rows'),
    ]
    STEP_H = 1.30
    for i, (ac, txt) in enumerate(STEPS):
        ty = yt - 0.06 - i * (STEP_H + 0.14)
        accent_box(ax, XR, ty, BOX_W, STEP_H, txt, ac, fs=10)
        if i < len(STEPS) - 1:
            arr(ax, XR, ty - STEP_H/2 - 0.02,
                XR, ty - STEP_H/2 - 0.12, c=ac)

    tag(ax, XR, yt - len(STEPS) * (STEP_H + 0.14) - 0.24,
        'Cap at 10 rows by default;\nask user before larger batches',
        c=SCORE_C, style='italic', fs=9)

    # Divider between sub-paths
    divx = (XL + XR) / 2
    ax.axvline(divx, ymin=0.03, ymax=0.73,
               color='#CCCCCC', linewidth=1.0, linestyle='--', zorder=1)

    save(fig, 'flow-score.png')


# ══════════════════════════════════════════════════════════════════════════════
#  FLOW 5 — DESCRIBE
# ══════════════════════════════════════════════════════════════════════════════
def draw_describe():
    FW, FH = 10.0, 17.5
    fig, ax = make_ax(FW, FH)
    c = DESC_C
    cx = FW / 2

    ax.text(cx, FH - 0.40, 'DESCRIBE Flow', ha='center', va='center',
            fontsize=16, fontweight='bold', color=TEXT)
    ax.text(cx, FH - 0.90, 'Retrieve metadata and schema for a resource',
            ha='center', va='center', fontsize=9, color=TEXT_DIM, style='italic')

    y = FH - 1.50
    entry_banner(ax, FW, y, c, 'DESCRIBE')
    arr(ax, cx, y - 0.36, cx, y - 0.82)
    y -= 1.12

    skill_card(ax, cx, y - 0.55, FW - 0.5, 1.35,
               'detail-strategy',
               'Get metadata / schema for a resource\nAlways verify first (except SCR)',
               c)
    arr(ax, cx, y - 0.55 - 0.68, cx, y - 0.55 - 1.12)
    y -= 1.92

    rbox(ax, cx, y, FW - 0.7, 0.56,
         'Resource type?', BOX_DARK, fg=c, bold=True, ec=c, fs=10)
    arr(ax, cx, y - 0.29, cx, y - 0.72)
    y -= 1.02

    DESC_ROWS = [
        ('MAS',     True,  'find-mas',    'mas-describe',    'model',              None),
        ('SCR',     False, None,          'scr-describe',    'name',               'no find-scr tool'),
        ('Job',     True,  'find-job',    'job-describe',    'name',               None),
        ('JobDef',  True,  'find-jobdef', 'jobdef-describe', 'name',               None),
        ('Table',   True,  'find-table',  'table-describe',  'lib, table, server', None),
        ('Program', 'N/A', None,          None,              None,                 'no describe tool'),
    ]
    ROW_H = 1.45
    for i, (lbl, verify, vtool, dtool, params, note) in enumerate(DESC_ROWS):
        ty = y - i * ROW_H
        rbox(ax, cx, ty, FW - 0.7, ROW_H - 0.08,
             '', BOX, lw=0.5, ec=BORDER + '88', radius=0.10)
        ax.text(0.8, ty + 0.40, lbl,
                ha='left', va='center', fontsize=10, color=c,
                fontweight='bold', zorder=5)
        if verify == 'N/A':
            rbox(ax, cx + 0.4, ty, FW - 2.5, 0.56,
                 'no describe tool — ask user for documentation',
                 BOX, fg=SKIP_C, lw=0.6, ec=SKIP_C+'88', radius=0.10)
        elif verify:
            accent_box(ax, cx + 0.4, ty + 0.38, FW - 2.5, 0.42,
                       f'*find-resources: sas-score-{vtool}',
                       SHARED_C, fs=8)
            badge(ax, cx + 0.4, ty - 0.22, f'sas-score-{dtool}', fs=8.5)
            if params:
                tag(ax, cx + 0.4, ty - 0.56, f'params: {params}')
        else:
            rbox(ax, cx + 0.4, ty + 0.38, FW - 2.5, 0.40,
                 f'skip verify  ({note})',
                 BOX, fg=SKIP_C, lw=0.5, ec=SKIP_C+'66', radius=0.09)
            badge(ax, cx + 0.4, ty - 0.22, f'sas-score-{dtool}', fs=8.5)
            if params:
                tag(ax, cx + 0.4, ty - 0.56, f'params: {params}')

    save(fig, 'flow-describe.png')


# ── Run all ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    draw_find()
    draw_list()
    draw_read()
    draw_score()
    draw_describe()
    print('All flows done.')
