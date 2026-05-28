"""
render-slides.py  —  Generate 7 slide PNGs for sas-score-mcp-workflow
Run: python render-slides.py
Output: slide-01.png … slide-07.png
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ─── Canvas ──────────────────────────────────────────────────────────────────
DPI  = 192
W_IN = 10.0
H_IN = 5.625
W    = int(W_IN * DPI)   # 1920
H    = int(H_IN * DPI)   # 1080

def px(inches): return int(round(inches * DPI))

# ─── Palette ─────────────────────────────────────────────────────────────────
def c(hex6): return tuple(int(hex6[i:i+2],16) for i in (0,2,4)) + (255,)

NAVY   = c("1A2B4A")
BLUE   = c("0074BE")
TEAL   = c("00A89D")
TEALD  = c("007A73")
SILVER = c("F0F4F8")
SLATE  = c("5A6A7A")
WHITE  = c("FFFFFF")
OFFWH  = c("F7F9FC")
TEXT   = c("1A2B4A")
MUTED  = c("6B7A8D")
DARK   = c("0D1F35")

# ─── Fonts ───────────────────────────────────────────────────────────────────
FD = "C:/Windows/Fonts"
def font(size, bold=False, italic=False, mono=False):
    try:
        if mono:
            for name in ["cour.ttf","consola.ttf","lucon.ttf"]:
                p = os.path.join(FD, name)
                if os.path.exists(p): return ImageFont.truetype(p, size)
        if bold and italic:
            p = os.path.join(FD, "arialbi.ttf")
            if os.path.exists(p): return ImageFont.truetype(p, size)
        if bold:
            for name in ["arialbd.ttf","calibrib.ttf"]:
                p = os.path.join(FD, name)
                if os.path.exists(p): return ImageFont.truetype(p, size)
        if italic:
            for name in ["ariali.ttf","calibrii.ttf"]:
                p = os.path.join(FD, name)
                if os.path.exists(p): return ImageFont.truetype(p, size)
        for name in ["arial.ttf","calibri.ttf"]:
            p = os.path.join(FD, name)
            if os.path.exists(p): return ImageFont.truetype(p, size)
    except: pass
    return ImageFont.load_default()

# ─── Drawing helpers ─────────────────────────────────────────────────────────

def rrect(img, x_in, y_in, w_in, h_in, fill, r_px=8):
    """Rounded rectangle; x/y/w/h in inches, radius in pixels."""
    draw = ImageDraw.Draw(img)
    x, y, w, h = px(x_in), px(y_in), px(w_in), px(h_in)
    draw.rounded_rectangle([x, y, x+w, y+h], radius=r_px, fill=fill)

def shadow_rrect(img, x_in, y_in, w_in, h_in, fill, r_px=8):
    """Rounded rect with drop shadow."""
    x, y, w, h = px(x_in), px(y_in), px(w_in), px(h_in)
    # Shadow layer
    sh = Image.new('RGBA', (W, H), (0,0,0,0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle([x+4, y+4, x+w+4, y+h+4], radius=r_px, fill=(0,0,0,28))
    img.alpha_composite(sh)
    # Main rect
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([x, y, x+w, y+h], radius=r_px, fill=fill)

def text_in_box(draw, text, x_in, y_in, w_in, h_in, fnt, color,
                align="left", valign="middle"):
    """Render text wrapped inside a box (coords in inches)."""
    bx, by, bw, bh = px(x_in), px(y_in), px(w_in), px(h_in)
    lines = []
    for para in str(text).split('\n'):
        words = para.split()
        if not words:
            lines.append('')
            continue
        cur = words[0]
        for word in words[1:]:
            test = cur + ' ' + word
            tw = fnt.getbbox(test)[2] - fnt.getbbox(test)[0]
            if tw <= bw - 8:
                cur = test
            else:
                lines.append(cur)
                cur = word
        lines.append(cur)

    lh = fnt.getbbox("Ag")[3] + 3
    total = len(lines) * lh
    sy = by + (bh - total)//2 if valign == "middle" else (by + bh - total if valign == "bottom" else by + 4)

    for i, line in enumerate(lines):
        if not line:
            continue
        lw = fnt.getbbox(line)[2] - fnt.getbbox(line)[0]
        if align == "center":
            lx = bx + (bw - lw)//2
        elif align == "right":
            lx = bx + bw - lw - 4
        else:
            lx = bx + 6
        ty = sy + i * lh
        if ty + lh > by + bh + 4:
            break
        draw.text((lx, ty), line, font=fnt, fill=color)

def bullets(img, items, x_in, y_in, w_in, h_in, fnt, color, dot_color=None, gap=4):
    """Bulleted list (coords in inches)."""
    draw = ImageDraw.Draw(img)
    bx, by, bw, bh = px(x_in), px(y_in), px(w_in), px(h_in)
    dc = dot_color or color
    lh = fnt.getbbox("Ag")[3] + gap
    cy = by + 4
    for item in items:
        if cy + lh > by + bh:
            break
        dr = max(3, lh//5)
        dy = cy + lh//2
        draw.ellipse([bx+3, dy-dr, bx+3+dr*2, dy+dr], fill=dc)
        indent = dr*2 + 10
        avail = bw - indent
        words = str(item).split()
        if not words:
            cy += lh; continue
        sub_lines = []
        cur = words[0]
        for w2 in words[1:]:
            test = cur + ' ' + w2
            if fnt.getbbox(test)[2] - fnt.getbbox(test)[0] <= avail:
                cur = test
            else:
                sub_lines.append(cur); cur = w2
        sub_lines.append(cur)
        for sl in sub_lines:
            if cy + lh > by + bh: break
            draw.text((bx + indent, cy), sl, font=fnt, fill=color)
            cy += lh
        cy += 2

# ─── Common slide header ──────────────────────────────────────────────────────
def new_slide(bg=OFFWH):
    return Image.new('RGBA', (W, H), bg)

def hdr(img, title, bg=NAVY):
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, px(0.55)], fill=bg)
    draw.text((px(0.35), px(0.125)), title,
              font=font(px(0.185), bold=True), fill=WHITE)

def card(img, title, items, x, y, w, h, accent):
    shadow_rrect(img, x, y, w, h, WHITE, r_px=8)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([px(x), px(y), px(x)+px(w), px(y)+px(0.28)], radius=8, fill=accent)
    draw.text((px(x)+10, px(y)+6), title,
              font=font(px(0.10), bold=True), fill=WHITE)
    bullets(img, items, x+0.1, y+0.30, w-0.18, h-0.38, font(px(0.09)), TEXT,
            dot_color=accent, gap=3)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ════════════════════════════════════════════════════════════════════════════
def slide1():
    img = new_slide(NAVY)
    draw = ImageDraw.Draw(img)

    # Left teal bar
    draw.rectangle([0, 0, px(0.18), H], fill=TEAL)

    # Badge
    draw.rounded_rectangle([px(0.35), px(0.3), px(0.35)+px(1.6), px(0.3)+px(0.3)],
                            radius=4, fill=TEAL)
    draw.text((px(0.48), px(0.34)), "MCP  ·  NODE.JS",
              font=font(px(0.09), bold=True), fill=WHITE)

    # Title
    draw.text((px(0.35), px(0.75)), "SAS Score MCP Server",
              font=font(px(0.44), bold=True), fill=WHITE)

    # Subtitle
    draw.text((px(0.35), px(1.78)), "AI-Powered SAS Viya Scoring Integration Workflow",
              font=font(px(0.20)), fill=c("CADCFC"))

    # Divider
    draw.rectangle([px(0.35), px(2.25), px(0.35)+px(3.5), px(2.25)+px(0.04)], fill=TEAL)

    # Tech badges
    badges = ["Claude", "GitHub Copilot", "SAS Viya", "Model Context Protocol"]
    bx = px(0.35)
    bfnt = font(px(0.09))
    for b in badges:
        bw = bfnt.getbbox(b)[2] - bfnt.getbbox(b)[0] + px(0.28)
        overlay = Image.new('RGBA', (W, H), (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        od.rounded_rectangle([bx, px(2.42), bx+bw, px(2.42)+px(0.28)],
                              radius=4, fill=(255,255,255,40))
        img.alpha_composite(overlay)
        draw2 = ImageDraw.Draw(img)
        tw = bfnt.getbbox(b)[2] - bfnt.getbbox(b)[0]
        draw2.text((bx + (bw-tw)//2, px(2.46)), b, font=bfnt, fill=WHITE)
        bx += bw + px(0.14)

    # Model types row
    models = ["MAS","SCR","Job","JobDef","Program","CAS Program"]
    mx = px(0.35)
    mfnt = font(px(0.085))
    model_colors = [BLUE, TEAL, c("3A5070"), c("5A6A7A"), c("00756B"), c("007A73")]
    for i, m in enumerate(models):
        mw = mfnt.getbbox(m)[2] - mfnt.getbbox(m)[0] + px(0.22)
        ov = Image.new('RGBA', (W, H), (0,0,0,0))
        ovd = ImageDraw.Draw(ov)
        mc = model_colors[i]
        ovd.rounded_rectangle([mx, px(2.88), mx+mw, px(2.88)+px(0.24)],
                               radius=4, fill=(mc[0], mc[1], mc[2], 180))
        img.alpha_composite(ov)
        d3 = ImageDraw.Draw(img)
        tmw = mfnt.getbbox(m)[2] - mfnt.getbbox(m)[0]
        d3.text((mx + (mw-tmw)//2, px(2.91)), m, font=mfnt, fill=WHITE)
        mx += mw + px(0.10)

    # Tagline
    draw.text((px(0.35), px(3.38)), "Route · Verify · Score · Describe · Read",
              font=font(px(0.12), italic=True), fill=c("8BAFD4"))

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — End-to-End Architecture
# ════════════════════════════════════════════════════════════════════════════
def slide2():
    img = new_slide(OFFWH)
    hdr(img, "End-to-End Architecture")

    layers = [
        ("AI Agent",             "Claude  ·  GitHub Copilot",                                                         NAVY),
        ("Skills Layer",         "request-routing  ·  find-resources  ·  list-resource  ·  read-strategy  ·  score-strategy  ·  detail-strategy",  BLUE),
        ("MCP Server (Node.js)", "Tool Registration  ·  Two-Tier Descriptions  · agent or no agent · Session Cache",                      TEAL),
        ("Transport",            "HTTP (Express + OAuth)   |   Stdio (CLI / Local)",                                   SLATE),
        ("Tool Execution",       "28 Tools: mas-score · scr-score · job-score · jobdef-score · program-score · cas-program-score · read-table …", c("3A5070")),
        ("Authentication",       "oauth  ·  oauthclient  ·  bearer  ·  token  ·  sascli  ·  password",                c("2E4A6A")),
        ("SAS Viya",             "MAS Model Scoring  ·  CAS Analytics  ·  Compute Jobs  ·  SCR Containers",            DARK),
    ]

    LH = 0.56
    GAP = 0.05
    ly = 0.68
    for i, (label, sub, bg) in enumerate(layers):
        shadow_rrect(img, 0.4, ly, 9.2, LH, bg, r_px=6)
        draw = ImageDraw.Draw(img)
        draw.text((px(0.58), px(ly)+6), label,
                  font=font(px(0.10), bold=True), fill=WHITE)
        text_in_box(draw, sub, 3.1, ly+0.04, 6.4, LH-0.08,
                    font(px(0.095)), WHITE, valign="middle")
        if i < len(layers)-1:
            ax, ay = px(4.85), px(ly+LH)
            draw.rectangle([ax, ay, ax+px(0.3), ay+px(GAP)], fill=TEAL)
        ly += LH + GAP

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Tool Catalog
# ════════════════════════════════════════════════════════════════════════════
def slide3():
    img = new_slide(OFFWH)
    hdr(img, "Tool Catalog  (28 Tools)")

    cols1 = [
        ("MAS Models",    BLUE,        ["list-mas","find-mas","mas-describe","mas-score"]),
        ("SCR Models",    TEAL,        ["list-scr","find-scr","scr-describe","scr-score"]),
        ("Job Models",    c("3A5070"), ["list-jobs","find-job","job-describe","job-score"]),
        ("JobDef Models", c("5A6A7A"), ["list-jobdefs","find-jobdef","jobdef-describe","jobdef-score"]),
    ]
    CW, CH, CY, GAP = 2.2, 1.4, 0.68, 0.06
    cx = 0.35
    for title, accent, items in cols1:
        card(img, title, items, cx, CY, CW, CH, accent)
        cx += CW + GAP

    cols2 = [
        ("Libraries",      NAVY,        ["list-libraries","find-library"],                                    2.9),
        ("Tables",         c("2E6DA4"), ["list-tables","find-table","table-describe","read-table","sas-query"], 3.05),
        ("Program Models", c("00756B"), ["program-score","cas-program-score","macro-score"],                    2.9),
    ]
    CY2, CH2 = 2.24, 1.55
    xs2 = [0.35, 3.50, 6.65]
    for i, (title, accent, items, w) in enumerate(cols2):
        card(img, title, items, xs2[i], CY2, w, CH2, accent)

    draw = ImageDraw.Draw(img)
    note = ("All tools prefixed sas-score-  (e.g. sas-score-mas-score)  ·  "
            "Job, JobDef, Program & CAS Program are all model types  ·  Standalone and agent modes")
    text_in_box(draw, note, 0.35, 3.95, 9.3, 0.28,
                font(px(0.088), italic=True), MUTED, align="center")

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Skills Architecture 
# ════════════════════════════════════════════════════════════════════════════
def slide4():
    img = new_slide(OFFWH)
    hdr(img, "Skills Architecture  ·  Decision Trees as Canonical Spec")

    # ── Pipeline row ──────────────────────────────────────────────────────────
    pipes = [
        ("Decision-Tree YAMLs",   "7 resource trees\n(mas · scr · job · jobdef\ntable · library · program)", NAVY),
        ("gen-routing.js",        "Reads YAMLs\nGenerates routing tables\nDetects primitive usage",           BLUE),
        ("SKILL.md  (generated)", "Routing table · Resolve rules\nDescribe table · Score table\nPrimitives reference", TEAL),
    ]
    pY = 0.72; pH = 1.0; pW = 2.6
    pXs = [0.35, 3.75, 7.12]
    for i, (title, sub, bg) in enumerate(pipes):
        shadow_rrect(img, pXs[i], pY, pW, pH, bg, r_px=8)
        draw = ImageDraw.Draw(img)
        draw.text((px(pXs[i])+10, px(pY)+8), title,
                  font=font(px(0.10), bold=True), fill=WHITE)
        text_in_box(draw, sub, pXs[i]+0.1, pY+0.30, pW-0.2, pH-0.36,
                    font(px(0.09)), c("D0E8FF"), valign="top")
        if i < len(pipes)-1:
            ax = px(pXs[i]+pW+0.04)
            ay = px(pY + pH/2)
            draw.rectangle([ax, ay-px(0.03), ax+px(0.32), ay+px(0.03)], fill=TEAL)
            draw.polygon([ax+px(0.28), ay-px(0.09),
                          ax+px(0.28), ay+px(0.09),
                          ax+px(0.48), ay], fill=TEAL)

    draw = ImageDraw.Draw(img)
    draw.text((px(3.2), px(pY+pH+0.08)),
              "npm run gen:routing  ·  npm run check:routing  (CI validation)",
              font=font(px(0.085), bold=True), fill=TEAL)

    # ── Two-tier descriptions ─────────────────────────────────────────────────
    tY = 2.18
    draw.text((px(0.35), px(tY)), "Two-Tier Tool Descriptions",
              font=font(px(0.12), bold=True), fill=NAVY)

    tiers = [
        ("Standalone Mode", "node cli.js",       NAVY, BLUE,
         ["Full verbose descriptions","USE / DON'T USE rules",
          "Routing examples & negative examples","Self-contained — no skills needed"]),
        ("Agent Mode",      "node cli.js --agent", TEAL, TEALD,
         ["Lean descriptions (~10 lines)","Parameter list + return value only",
          "Skills + Decision Trees handle routing","Fewer tokens, cleaner context window"]),
    ]
    for i, (label, flag, bg, accent, items) in enumerate(tiers):
        tx = 0.35 + i*4.88; tw = 4.55; th = 2.15; ts = tY + 0.35
        shadow_rrect(img, tx, ts, tw, th, bg, r_px=8)
        draw = ImageDraw.Draw(img)
        # Accent bar
        draw.rounded_rectangle([px(tx), px(ts), px(tx)+px(tw), px(ts)+px(0.32)],
                                radius=8, fill=accent)
        draw.text((px(tx)+12, px(ts)+7), label,
                  font=font(px(0.105), bold=True), fill=WHITE)
        # Flag badge — dark background, white text
        fb_w = px(1.5); fb_h = px(0.24)
        fb_x = px(tx+tw) - fb_w - 10; fb_y = px(ts)+8
        draw.rounded_rectangle([fb_x, fb_y, fb_x+fb_w, fb_y+fb_h], radius=4,
                                fill=(0,0,0,100))
        draw.text((fb_x+6, fb_y+3), flag,
                  font=font(px(0.08), mono=True), fill=c("80FFE8"))
        # Bullets
        bullets(img, items, tx+0.15, ts+0.40, tw-0.25, th-0.50,
                font(px(0.095)), WHITE, dot_color=c("CADCFC"), gap=6)

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — Data Flow: Model Scoring
# ════════════════════════════════════════════════════════════════════════════
def slide5():
    img = new_slide(OFFWH)
    hdr(img, "Data Flow Example  ·  Model Scoring")

    steps = [
        ("1","User Request",    '"Score first 2 rows of Public.breast_cancer with breastcancer.mas"',      NAVY,       False),
        ("2","Skills Layer",    "request-routing strategy decides it should use the score-strategy",      BLUE,       False),
        ("3","Verify",          "score-strategy -> find-resources skill confirms breastcancer mas model exists in SAS Viya",            c("2E6DA4"),False),
        ("4","Verify",          "score-strategy -> find-resources skill confirms Public.breast_cancer table exists in SAS Viya",   c("2E6DA4"),False),
        ("5","Read Table",      "score-strategy -> read-strategy skill reads 2 rows from Public.breast_cancer",   c("2E6DA4"),False),
        ("6","MCP Tool",        "score-strategy -> mas-score tool invoked with model name + data from Public.breast_cancer",               TEAL,       False),
        ("7","Helper / Restaf", "score-strategy -> _masScoring() → masSetup() → masDescribe() → masRun()",          TEALD,      True),
        ("8","Result",          '[{EM_CLASSIFICATION:8, P_diagnosisB:0.96, P_diagnosisM:0.04, ...}]', c("0D4F3A"),True),
    ]

    SW = 9.2; SH = 0.60; SX = 0.4
    sy = 0.68
    for n, title, detail, bg, mono in steps:
        shadow_rrect(img, SX, sy, SW, SH, bg, r_px=6)
        draw = ImageDraw.Draw(img)
        # Number circle
        cx2 = px(SX)+px(0.1); cy2 = px(sy)+px(0.10)
        r = px(0.20)
        draw.ellipse([cx2, cy2, cx2+r*2, cy2+r*2], fill=TEAL)
        tw = font(px(0.11), bold=True).getbbox(n)[2]
        draw.text((cx2 + r - tw//2, cy2 + r//3), n,
                  font=font(px(0.11), bold=True), fill=WHITE)
        draw.text((px(SX)+px(0.62), px(sy)+8), title,
                  font=font(px(0.10), bold=True), fill=WHITE)
        text_in_box(draw, detail, SX+2.55, sy+0.06, 6.5, SH-0.12,
                    font(px(0.09), mono=mono), c("D0E8FF"), valign="middle")
        if n != "6":
            ax, ay = px(4.7), px(sy+SH)
            draw.rectangle([ax, ay, ax+px(0.3), ay+px(0.06)], fill=TEAL)
        sy += SH + 0.055

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Authentication Flows
# ════════════════════════════════════════════════════════════════════════════
def slide6():
    img = new_slide(OFFWH)
    hdr(img, "Authentication Flows")

    auths = [
        ("oauth",       "Recommended", "Full browser-based OAuth 2.0 with PKCE. Most secure.",         BLUE),
        ("oauthclient", "",            "OAuth where the client app manages token exchange.",             c("2E6DA4")),
        ("bearer",      "CI/CD",       "Pass a valid SAS Viya access token directly.",                  c("3A5070")),
        ("token",       "",            "Load access token from a local file path.",                     SLATE),
        ("sascli",      "",            "Use authentication from an existing sas-viya-cli profile.",    c("6B7A8D")),
        ("password",    "Avoid",       "Direct credential auth. Use OAuth-based flows for security.",   c("8A3030")),
    ]

    CW = 4.55; CH = 1.15
    positions = [
        (0.35, 0.68), (4.98, 0.68),
        (0.35, 1.98), (4.98, 1.98),
        (0.35, 3.28), (4.98, 3.28),
    ]
    for name, tag, desc, bg in auths:
        ax, ay = positions[auths.index((name, tag, desc, bg))]
        shadow_rrect(img, ax, ay, CW, CH, bg, r_px=8)
        draw = ImageDraw.Draw(img)
        # Name badge — solid dark bg, monospace font
        nbx = px(ax)+px(0.12); nby = px(ay)+px(0.14)
        nbw = px(1.35); nbh = px(0.30)
        draw.rounded_rectangle([nbx, nby, nbx+nbw, nby+nbh], radius=5,
                                fill=(0,0,0,90))
        nfnt = font(px(0.105), bold=True, mono=True)
        ntw = nfnt.getbbox(name)[2] - nfnt.getbbox(name)[0]
        draw.text((nbx + (nbw-ntw)//2, nby+5), name, font=nfnt, fill=c("80FFE8"))
        # Tag badge
        if tag:
            tbg = TEAL if tag != "Avoid" else c("CC4444")
            tbx = nbx + nbw + 12; tby = nby + 3
            tfnt = font(px(0.085), bold=True)
            tbw = tfnt.getbbox(tag)[2] - tfnt.getbbox(tag)[0] + px(0.22)
            draw.rounded_rectangle([tbx, tby, tbx+tbw, tby+px(0.24)], radius=4, fill=tbg)
            draw.text((tbx+6, tby+3), tag, font=tfnt, fill=WHITE)
        # Description
        text_in_box(draw, desc, ax+0.12, ay+0.56, CW-0.22, CH-0.62,
                    font(px(0.095)), c("E8F4FF"), valign="top")

    return img.convert('RGB')

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Deployment Options
# ════════════════════════════════════════════════════════════════════════════
def slide7():
    img = new_slide(NAVY)
    hdr(img, "Deployment Options", bg=DARK)

    opts = [
        ("Local CLI",
         "npx @sassoftware/\nsas-score-mcp-serverjs",
         "Stdio Transport",
         ["No global install needed","Claude Desktop & VS Code","Single-user development","Ideal for local testing"],
         TEAL),
        ("Docker Container",
         "ghcr.io/sassoftware/\nsas-score-mcp-serverjs:latest",
         "HTTP Transport",
         ["Pull from GitHub Container Registry","HTTP server on port 8080","Multi-user concurrent support","Deploy anywhere Docker runs"],
         BLUE),
        ("Cloud  (Azure / AWS)",
         "Container App · ECS · Kubernetes",
         "HTTP + OAuth",
         ["Managed container service","Enterprise OAuth PKCE","Scalable multi-user architecture","Production SAS Viya integration"],
         c("8B5CF6")),
    ]

    CW = 2.95; CH = 4.35; CY = 0.72
    cxs = [0.35, 3.48, 6.61]
    for i, (title, cmd, transport, points, accent) in enumerate(opts):
        cx = cxs[i]
        # Card bg
        card_bg = Image.new('RGBA', (W, H), (0,0,0,0))
        cd = ImageDraw.Draw(card_bg)
        cd.rounded_rectangle([px(cx), px(CY), px(cx)+px(CW), px(CY)+px(CH)],
                              radius=10, fill=(255,255,255,18))
        img.alpha_composite(card_bg)
        draw = ImageDraw.Draw(img)
        # Accent header bar
        draw.rounded_rectangle([px(cx), px(CY), px(cx)+px(CW), px(CY)+px(0.35)],
                                radius=10, fill=accent)
        draw.text((px(cx)+12, px(CY)+8), title,
                  font=font(px(0.12), bold=True), fill=WHITE)
        # Transport badge
        tbx = px(cx)+px(0.12); tby = px(CY)+px(0.43)
        tbw = px(CW-0.25); tbh = px(0.28)
        tr = accent
        draw.rounded_rectangle([tbx, tby, tbx+tbw, tby+tbh], radius=5,
                                fill=(tr[0], tr[1], tr[2], 90))
        tfnt = font(px(0.10), bold=True)
        ttw = tfnt.getbbox(transport)[2] - tfnt.getbbox(transport)[0]
        draw.text((tbx + (tbw-ttw)//2, tby+5), transport, font=tfnt, fill=WHITE)
        # Command
        cmd_col = c("80FFE8") if accent == TEAL else c("CADCFC")
        text_in_box(draw, cmd, cx+0.12, CY+0.80, CW-0.22, 0.60,
                    font(px(0.085), mono=True), cmd_col, valign="top")
        # Bullet points
        bullets(img, points, cx+0.12, CY+1.50, CW-0.22, 2.55,
                font(px(0.095)), c("D0E8FF"), dot_color=accent, gap=7)

    return img.convert('RGB')

# ─── Main ────────────────────────────────────────────────────────────────────
slides = [slide1, slide2, slide3, slide4, slide5, slide6, slide7]
for i, fn in enumerate(slides, 1):
    out = f"slide-{i:02d}.png"
    print(f"Rendering {out} …", end=" ", flush=True)
    img = fn()
    img.save(out, "PNG", optimize=True)
    print(f"saved ({os.path.getsize(out)//1024} KB)")

print("Done.")
