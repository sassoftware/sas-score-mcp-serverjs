#!/usr/bin/env python3
"""
Generates routing-flowchart.png
White background, light-grey boxes, skill references prefixed with *.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np

# ── Palette ───────────────────────────────────────────────────────────────────
BG        = '#FFFFFF'   # page background
BOX       = '#F2F2F2'   # standard box fill
BOX_DARK  = '#E8E8E8'   # slightly darker (skill cards, decision boxes)
BORDER    = '#CCCCCC'   # standard border
TEXT      = '#111111'   # primary text
TEXT_DIM  = '#555555'   # secondary / annotation text
ARROW     = '#888888'   # arrow colour

# Intent accent colours (used only for borders, left bars, text highlights)
FIND_C    = '#005B99'
LIST_C    = '#1144BB'
READ_C    = '#116633'
SCORE_C   = '#5511AA'
DESC_C    = '#AA5500'
SHARED_C  = '#AA0044'   # *find-resources shared service
VERIFY_C  = '#994400'
SKIP_C    = '#AA1111'
MERGE_C   = '#115566'

FW, FH = 38, 26
fig, ax = plt.subplots(figsize=(FW, FH))
ax.set_xlim(0, FW)
ax.set_ylim(0, FH)
ax.axis('off')
ax.set_facecolor(BG)
fig.patch.set_facecolor(BG)


# ── Drawing helpers ───────────────────────────────────────────────────────────
def rbox(ax, cx, cy, w, h, text, bg=BOX, fg=TEXT, fs=9, bold=False,
         lw=0.8, ec=BORDER, radius=0.14, zorder=3, alpha=1.0):
    rect = FancyBboxPatch(
        (cx - w/2, cy - h/2), w, h,
        boxstyle=f"round,pad=0,rounding_size={radius}",
        linewidth=lw, edgecolor=ec, facecolor=bg, alpha=alpha, zorder=zorder
    )
    ax.add_patch(rect)
    if text:
        ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
                color=fg, fontweight='bold' if bold else 'normal',
                zorder=zorder+1, multialignment='center', linespacing=1.35)

def badge(ax, cx, cy, text, fs=8.5):
    """Monospace tool-name badge — light grey, dark text."""
    w = len(text) * 0.107 + 0.5
    rect = FancyBboxPatch(
        (cx - w/2, cy - 0.23), w, 0.46,
        boxstyle="round,pad=0,rounding_size=0.12",
        linewidth=0.8, edgecolor='#AAAAAA', facecolor=BOX, zorder=4
    )
    ax.add_patch(rect)
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
            color='#222222', family='monospace', zorder=5)

def skill_card(ax, cx, cy, w, h, name, subtitle, accent):
    """Skill card: light-grey bg + coloured left bar. Name prefixed with *."""
    rbox(ax, cx, cy, w, h, '', BOX_DARK, lw=1.0, ec=accent, radius=0.18, zorder=3)
    bar = FancyBboxPatch(
        (cx - w/2, cy - h/2 + 0.06), 0.22, h - 0.12,
        boxstyle="round,pad=0,rounding_size=0.08",
        linewidth=0, facecolor=accent, zorder=4
    )
    ax.add_patch(bar)
    ax.text(cx + 0.18, cy + h/2 - 0.40, f'*{name}',
            ha='center', va='center', fontsize=10, fontweight='bold',
            color=accent, zorder=5)
    if subtitle:
        ax.text(cx + 0.18, cy - 0.08, subtitle,
                ha='center', va='center', fontsize=7.8, color=TEXT_DIM,
                zorder=5, multialignment='center', linespacing=1.35)

def accent_box(ax, cx, cy, w, h, text, accent, fs=8):
    """Light-grey box with coloured left stripe and coloured text."""
    rbox(ax, cx, cy, w, h, '', BOX, lw=0.6, ec=accent+'88', radius=0.12, zorder=3)
    stripe = FancyBboxPatch(
        (cx - w/2, cy - h/2 + 0.04), 0.14, h - 0.08,
        boxstyle="round,pad=0,rounding_size=0.06",
        linewidth=0, facecolor=accent, zorder=4
    )
    ax.add_patch(stripe)
    ax.text(cx + 0.12, cy, text, ha='center', va='center',
            fontsize=fs, color=accent, zorder=5, multialignment='center',
            linespacing=1.3)

def arr(ax, x0, y0, x1, y1, c=ARROW, lw=1.2, rad=0.0):
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='->', color=c, lw=lw,
                                connectionstyle=f'arc3,rad={rad}'), zorder=2)

def hline(ax, y, c='#00000015'):
    ax.axhline(y, color=c, linewidth=0.6, zorder=1)

def tag(ax, cx, cy, text, c=TEXT_DIM, fs=7.5, style='normal'):
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
            color=c, style=style, zorder=6, multialignment='center',
            linespacing=1.3)


# ══════════════════════════════════════════════════════════════════════════════
#  TITLE
# ══════════════════════════════════════════════════════════════════════════════
ax.text(FW/2, FH - 0.55, 'Request-Routing — Skill Orchestration',
        ha='center', va='center', fontsize=18, fontweight='bold',
        color=TEXT, zorder=5)
ax.text(FW/2, FH - 1.1,
        'How *request-routing dispatches to each skill for FIND · LIST · READ · SCORE · DESCRIBE',
        ha='center', va='center', fontsize=9.5, color=TEXT_DIM, zorder=5,
        style='italic')
hline(ax, FH - 1.45)

# ══════════════════════════════════════════════════════════════════════════════
#  REQUEST-ROUTING HUB
# ══════════════════════════════════════════════════════════════════════════════
HUB_Y = FH - 3.15
HUB_W = 26.5
HUB_H = 2.6

rbox(ax, FW/2, HUB_Y, HUB_W, HUB_H, '', BOX_DARK,
     lw=1.5, ec='#4455AA', radius=0.25, zorder=2)

# Left accent bar
bar = FancyBboxPatch(
    (FW/2 - HUB_W/2, HUB_Y - HUB_H/2 + 0.07), 0.26, HUB_H - 0.14,
    boxstyle="round,pad=0,rounding_size=0.08",
    linewidth=0, facecolor='#4455AA', zorder=3
)
ax.add_patch(bar)

ax.text(FW/2 - HUB_W/2 + 1.2, HUB_Y + 0.75,
        '*request-routing  skill', ha='left', va='center',
        fontsize=12, fontweight='bold', color='#2233AA', zorder=4)

ax.text(FW/2 - HUB_W/2 + 1.2, HUB_Y + 0.1,
        'Step 1   Parse a.b notation:\n'
        '   b ∈ { mas | job | jobdef | scr | sas | casl }  →  model type,  name = a\n'
        '   b = anything else  →  table,  lib = a,  table = b',
        ha='left', va='center', fontsize=8.5, color=TEXT, zorder=4,
        family='monospace', linespacing=1.55)

ax.text(FW/2 - HUB_W/2 + 1.2, HUB_Y - 0.72,
        'Step 2   Classify intent  →  find | list | read/query | score | describe',
        ha='left', va='center', fontsize=8.5, color=TEXT, zorder=4)

# Right: trigger keywords
ax.text(FW/2 + 8.6, HUB_Y + 0.65, 'Trigger keywords',
        ha='center', va='center', fontsize=8.5, color=TEXT_DIM,
        fontweight='bold', zorder=4)
kw = [
    (FIND_C,  'find, locate, does X exist, verify'),
    (LIST_C,  'list, show all, browse, enumerate'),
    (READ_C,  'read, show rows, count, average, query'),
    (SCORE_C, 'score, predict, run model'),
    (DESC_C,  'describe, what inputs, metadata'),
]
for i, (c, txt) in enumerate(kw):
    ky = HUB_Y + 0.18 - i * 0.39
    ax.plot([FW/2 + 6.2, FW/2 + 6.6], [ky, ky],
            color=c, linewidth=3.5, solid_capstyle='round', zorder=4)
    ax.text(FW/2 + 6.8, ky, txt, ha='left', va='center',
            fontsize=8, color=TEXT, zorder=4)

# ══════════════════════════════════════════════════════════════════════════════
#  5 INTENT COLUMNS
# ══════════════════════════════════════════════════════════════════════════════
COLS = {
    'find':     {'cx': 3.2,  'cw': 5.6,  'c': FIND_C},
    'list':     {'cx': 9.5,  'cw': 5.6,  'c': LIST_C},
    'read':     {'cx': 15.8, 'cw': 5.8,  'c': READ_C},
    'score':    {'cx': 23.0, 'cw': 9.4,  'c': SCORE_C},
    'describe': {'cx': 34.0, 'cw': 7.2,  'c': DESC_C},
}

INTENT_Y = HUB_Y - HUB_H/2 - 0.68

# Fan-out line
FAN_Y = HUB_Y - HUB_H/2 - 0.05
ax.plot([COLS['find']['cx'], COLS['describe']['cx']],
        [FAN_Y - 0.28, FAN_Y - 0.28], color=ARROW, lw=1.0, zorder=2)
for v in COLS.values():
    ax.plot([v['cx'], v['cx']], [FAN_Y - 0.28, INTENT_Y + 0.36],
            color=ARROW, lw=1.0, zorder=2)
    ax.annotate('', xy=(v['cx'], INTENT_Y + 0.36),
                xytext=(v['cx'], INTENT_Y + 0.56),
                arrowprops=dict(arrowstyle='->', color=ARROW, lw=1.0), zorder=2)

LABELS = {'find': 'FIND', 'list': 'LIST', 'read': 'READ / QUERY',
          'score': 'SCORE', 'describe': 'DESCRIBE'}
for k, v in COLS.items():
    rbox(ax, v['cx'], INTENT_Y, v['cw'] - 0.1, 0.64,
         LABELS[k], BOX, fg=v['c'], fs=11, bold=True,
         lw=1.5, ec=v['c'], radius=0.14)

# Lane backgrounds (very light tint + border)
LANE_TOP = INTENT_Y - 0.36
LANE_BOT = 0.55
for v in COLS.values():
    rect = FancyBboxPatch(
        (v['cx'] - v['cw']/2 + 0.05, LANE_BOT),
        v['cw'] - 0.1, LANE_TOP - LANE_BOT,
        boxstyle="round,pad=0,rounding_size=0.18",
        linewidth=0.6, edgecolor=v['c'] + '44', facecolor='#FAFAFA',
        zorder=0
    )
    ax.add_patch(rect)


# ══════════════════════════════════════════════════════════════════════════════
#  FIND LANE
# ══════════════════════════════════════════════════════════════════════════════
cx, c, cw = COLS['find']['cx'], COLS['find']['c'], COLS['find']['cw']
y = INTENT_Y - 0.76

skill_card(ax, cx, y - 0.52, cw - 0.2, 1.35,
           'find-resources', 'Verify a named resource exists\nbefore any action', SHARED_C)
y -= 1.44
arr(ax, cx, INTENT_Y - 0.36, cx, y + 0.67 + 0.04)

y -= 0.58
rbox(ax, cx, y, cw-0.3, 0.68,
     'Parse a.b · determine server\n(CAS known libs / SAS known libs\n/ try cas→sas)')
arr(ax, cx, y - 0.35, cx, y - 0.75)
y -= 1.0

rbox(ax, cx, y, cw-0.3, 0.58, 'Resource type?', BOX_DARK,
     fg=c, bold=True, ec=c)
y -= 0.54

FIND_TOOLS = [
    ('table',   'find-table',   '(lib, name, server)'),
    ('library', 'find-library', '(name, server)'),
    ('MAS',     'find-mas',     '(name)'),
    ('Job',     'find-job',     '(name)'),
    ('JobDef',  'find-jobdef',  '(name)'),
    ('SCR',     None,           'no find tool — ask user'),
]
for i, (lbl, tool, note) in enumerate(FIND_TOOLS):
    ty = y - 0.42 - i * 0.88
    ax.text(cx - cw/2 + 0.6, ty + 0.14, lbl,
            ha='left', va='center', fontsize=7.5, color=c, fontweight='bold', zorder=5)
    if tool:
        badge(ax, cx + 0.5, ty + 0.14, f'sas-score-{tool}')
        tag(ax, cx + 0.5, ty - 0.24, note)
    else:
        tag(ax, cx + 0.3, ty + 0.08, note, c=SKIP_C)


# ══════════════════════════════════════════════════════════════════════════════
#  LIST LANE
# ══════════════════════════════════════════════════════════════════════════════
cx, c, cw = COLS['list']['cx'], COLS['list']['c'], COLS['list']['cw']
y = INTENT_Y - 0.76

skill_card(ax, cx, y - 0.52, cw - 0.2, 1.30,
           'list-resource', 'Browse / discover resources\n(not for verification)', c)
y -= 1.40
arr(ax, cx, INTENT_Y - 0.36, cx, y + 0.65 + 0.04)

y -= 0.55
rbox(ax, cx, y, cw-0.3, 0.52,
     'Trigger: "list", "show all",\n"browse", "enumerate"')
arr(ax, cx, y - 0.27, cx, y - 0.67)
y -= 0.85

rbox(ax, cx, y, cw-0.3, 0.50,
     'Pagination: start=1, limit=10\n(always pass these defaults)')
arr(ax, cx, y - 0.26, cx, y - 0.70)
y -= 0.88

LIST_TOOLS = [
    ('Libraries', 'list-libraries', 'server: cas|sas|all'),
    ('Tables',    'list-tables',    'lib, server'),
    ('MAS',       'list-mas',       'start, limit'),
    ('Jobs',      'list-jobs',      'start, limit'),
    ('JobDefs',   'list-jobdefs',   'start, limit'),
    ('SCR',       None,             'no list tool'),
]
for i, (lbl, tool, note) in enumerate(LIST_TOOLS):
    ty = y - 0.42 - i * 0.88
    ax.text(cx - cw/2 + 0.55, ty + 0.14, lbl,
            ha='left', va='center', fontsize=7.5, color=c, fontweight='bold', zorder=5)
    if tool:
        badge(ax, cx + 0.5, ty + 0.14, f'sas-score-{tool}')
        tag(ax, cx + 0.5, ty - 0.24, note)
    else:
        tag(ax, cx + 0.3, ty + 0.08, note, c=SKIP_C)


# ══════════════════════════════════════════════════════════════════════════════
#  READ LANE
# ══════════════════════════════════════════════════════════════════════════════
cx, c, cw = COLS['read']['cx'], COLS['read']['c'], COLS['read']['cw']
y = INTENT_Y - 0.76

skill_card(ax, cx, y - 0.52, cw - 0.2, 1.30,
           'read-strategy', 'Raw rows vs SQL aggregation\nAlways verify table first', c)
y -= 1.40
arr(ax, cx, INTENT_Y - 0.36, cx, y + 0.65 + 0.04)

y -= 0.58
accent_box(ax, cx, y, cw-0.3, 0.60,
           '① *find-resources\nVerify table exists · determine server',
           SHARED_C, fs=8)
arr(ax, cx, y - 0.31, cx, y - 0.72)
y -= 0.92

# Decision diamond
DH = 0.76
pts = np.array([[cx, y+DH/2], [cx+1.8, y], [cx, y-DH/2], [cx-1.8, y]])
ax.fill(pts[:,0], pts[:,1], color=BOX_DARK, zorder=3)
ax.plot(pts[:,0], pts[:,1], color=c, lw=1.0, zorder=3)
ax.text(cx, y, 'Aggregation /\nJOIN needed?', ha='center', va='center',
        fontsize=8, color=c, fontweight='bold', zorder=4, multialignment='center')
y -= DH/2

y_br = y - 0.52
x_l, x_r = cx - 1.4, cx + 1.4

arr(ax, cx - 1.8, y + DH/2 - 0.38, x_l, y_br + 0.25, c=c)
arr(ax, cx + 1.8, y + DH/2 - 0.38, x_r, y_br + 0.25, c=c)
tag(ax, x_l - 0.2, y + DH/2 - 0.14, 'yes', c=c, fs=7.5)
tag(ax, x_r + 0.2, y + DH/2 - 0.14, 'no',  c=c, fs=7.5)

badge(ax, x_l, y_br, 'sas-score-sas-query')
tag(ax, x_l, y_br - 0.42, 'COUNT/SUM/AVG\nGROUP BY · JOIN')

badge(ax, x_r, y_br, 'sas-score-read-table')
tag(ax, x_r, y_br - 0.42, 'lib, table, server\nstart, limit, where')

tag(ax, cx, y_br - 1.05,
    'WHERE filter alone → use read-table\n(not sas-query)', c=READ_C, style='italic')


# ══════════════════════════════════════════════════════════════════════════════
#  SCORE LANE  (inline + table-row sub-paths)
# ══════════════════════════════════════════════════════════════════════════════
cx, c, cw = COLS['score']['cx'], COLS['score']['c'], COLS['score']['cw']
y = INTENT_Y - 0.76

skill_card(ax, cx, y - 0.52, cw - 0.2, 1.38,
           'score-strategy',
           'Verify model → score inputs\nException: SCR + Programs skip verify', c)
y -= 1.48
arr(ax, cx, INTENT_Y - 0.36, cx, y + 0.69 + 0.04)
arr(ax, cx, y, cx, y - 0.50)
y -= 0.68

rbox(ax, cx, y, cw-0.3, 0.54, 'Source of inputs?',
     BOX_DARK, fg=c, bold=True, ec=c)
y -= 0.50

XL, XR = cx - 2.8, cx + 2.8

arr(ax, cx - 1.5, y, XL, y - 0.50, c=c)
arr(ax, cx + 1.5, y, XR, y - 0.50, c=c)
tag(ax, cx - 2.2, y - 0.24, 'inline\nscenario', c=c)
tag(ax, cx + 2.2, y - 0.24, 'table\nrows', c=c)
y -= 0.72

# ── Inline sub-path ───────────────────────────────────────────────────────────
yi = y
accent_box(ax, XL, yi, 4.4, 0.62,
           '① *find-resources\nVerify model exists\n(skip for SCR + Programs)',
           SHARED_C, fs=8)
arr(ax, XL, yi - 0.32, XL, yi - 0.86)
yi -= 1.12

SCORE_TOOLS = [
    ('MAS',     'mas-score',          'model, scenario'),
    ('SCR ✓',   'scr-score',          'name, scenario'),
    ('Job',     'job-score',           'name, scenario'),
    ('JobDef',  'jobdef-score',        'name, scenario'),
    ('Prog ✓',  'program-score',       'src, scenario…'),
    ('CAS ✓',   'cas-program-score',   'src, scenario…'),
    ('Macro ✓', 'macro-score',         'macro, scenario'),
]
for i, (lbl, tool, params) in enumerate(SCORE_TOOLS):
    ty = yi - i * 0.83
    skip = '✓' in lbl
    badge(ax, XL, ty + 0.13, f'sas-score-{tool}')
    fc = SKIP_C if skip else c
    tag(ax, XL - 1.8, ty + 0.13, lbl.replace(' ✓',''), c=fc, fs=7.5)
    tag(ax, XL, ty - 0.25, params)

# ✓ skip legend
tag(ax, XL, yi - len(SCORE_TOOLS) * 0.83 - 0.1,
    '✓ = skip verify (direct execute)', c=SKIP_C, style='italic')

# ── Table-row sub-path ────────────────────────────────────────────────────────
yt = y
STEPS = [
    (SHARED_C, '① *find-resources\nVerify model + verify table\n(determine server)'),
    (READ_C,   '② *read-strategy\nRead rows from table\n(read-table or sas-query)'),
    (c,        '③ Map columns\nAlign table columns to\nmodel input variables'),
    (c,        '④ Score each row\nCall appropriate\nscoring tool'),
    (MERGE_C,  '⑤ Merge & return\nAttach predictions to\ninput rows'),
]
for i, (ac, txt) in enumerate(STEPS):
    ty = yt - 0.08 - i * 1.28
    accent_box(ax, XR, ty, 4.5, 1.0, txt, ac, fs=8)
    if i < len(STEPS) - 1:
        arr(ax, XR, ty - 0.51, XR, ty - 0.77, c=ac)

tag(ax, XR, yt - len(STEPS) * 1.28 + 0.02,
    'Cap at 10 rows by default;\nask user before larger batches',
    c=SCORE_C, style='italic')


# ══════════════════════════════════════════════════════════════════════════════
#  DESCRIBE LANE
# ══════════════════════════════════════════════════════════════════════════════
cx, c, cw = COLS['describe']['cx'], COLS['describe']['c'], COLS['describe']['cw']
y = INTENT_Y - 0.76

skill_card(ax, cx, y - 0.52, cw - 0.2, 1.40,
           'detail-strategy',
           'Get metadata/schema for a resource\nAlways verify first (except SCR)',
           c)
y -= 1.50
arr(ax, cx, INTENT_Y - 0.36, cx, y + 0.70 + 0.04)

y -= 0.58
rbox(ax, cx, y, cw-0.3, 0.58, 'Resource type?',
     BOX_DARK, fg=c, bold=True, ec=c)
arr(ax, cx, y - 0.30, cx, y - 0.70)
y -= 0.92

DESC_ROWS = [
    ('MAS',     True,  'find-mas',    'mas-describe',    'model'),
    ('SCR',     False, None,          'scr-describe',    'name'),
    ('Job',     True,  'find-job',    'job-describe',    'name'),
    ('JobDef',  True,  'find-jobdef', 'jobdef-describe', 'name'),
    ('Table',   True,  'find-table',  'table-describe',  'lib, table, server'),
    ('Program', 'N/A', None,          None,              None),
]
for i, (lbl, verify, vtool, dtool, params) in enumerate(DESC_ROWS):
    ty = y - i * 1.44
    ax.text(cx - cw/2 + 0.5, ty + 0.28, lbl,
            ha='left', va='center', fontsize=8, color=c, fontweight='bold', zorder=5)
    if verify == 'N/A':
        rbox(ax, cx + 0.2, ty, cw-1.1, 0.52,
             'no describe tool\nask user for docs',
             BOX, fg=SKIP_C, lw=0.6, ec=SKIP_C+'88', radius=0.12)
    elif verify:
        accent_box(ax, cx + 0.2, ty + 0.38, cw-1.1, 0.42,
                   f'*find-resources: {vtool}', SHARED_C, fs=7.5)
        badge(ax, cx + 0.2, ty - 0.24, f'sas-score-{dtool}')
        if params:
            tag(ax, cx + 0.2, ty - 0.62, params)
    else:
        rbox(ax, cx + 0.2, ty + 0.38, cw-1.1, 0.40,
             'skip verify (SCR)',
             BOX, fg=SKIP_C, lw=0.5, ec=SKIP_C+'66', radius=0.10)
        badge(ax, cx + 0.2, ty - 0.24, f'sas-score-{dtool}')
        if params:
            tag(ax, cx + 0.2, ty - 0.62, params)


# ══════════════════════════════════════════════════════════════════════════════
#  SHARED-SERVICE BANNER
# ══════════════════════════════════════════════════════════════════════════════
SR_Y = 5.35
accent_box(ax, FW/2, SR_Y, FW - 0.5, 0.66,
           '*find-resources  is a shared service — called by READ, SCORE, and DESCRIBE '
           'to verify resources before executing.   FIND calls it directly.',
           SHARED_C, fs=8.5)

# ══════════════════════════════════════════════════════════════════════════════
#  LEGEND
# ══════════════════════════════════════════════════════════════════════════════
LEG_Y = 1.75
hline(ax, LEG_Y + 0.52)
items = [
    (SHARED_C, '*find-resources  (shared verification service)'),
    ('#444444', 'sas-score-<tool>  execution tool (monospace badge)'),
    (SKIP_C,   'skip verify / no tool available'),
    ('#888888', 'pagination: start=1, limit=10 default'),
]
for i, (clr, txt) in enumerate(items):
    bx = 0.8 + i * (FW / 4)
    ax.plot([bx, bx + 0.4], [LEG_Y, LEG_Y], color=clr,
            linewidth=4, solid_capstyle='round', zorder=3)
    ax.text(bx + 0.6, LEG_Y, txt, fontsize=8, color=TEXT, va='center')

ax.text(FW/2, 0.82,
        '*request-routing is the single source-of-truth router.  '
        'It parses a.b notation, classifies intent, and delegates to the appropriate *skill.',
        ha='center', va='center', fontsize=8, color=TEXT_DIM, style='italic')

# ── Save ──────────────────────────────────────────────────────────────────────
out = 'routing-flowchart.png'
plt.savefig(out, dpi=155, bbox_inches='tight', facecolor=BG, edgecolor='none')
plt.close()
print(f'Saved: {out}')
