const pptxgen = require("pptxgenjs");

// ─── SAS 2023 brand colors ─────────────────────────────────────────────────
const C = {
  navy:    "032954",
  blue:    "0766D1",
  ltBlue:  "4398F9",
  palBlue: "C4DEFD",
  gray:    "7E889A",
  ltGray:  "BAC0C9",
  white:   "FFFFFF",
  black:   "000000",
};

const FONT_HDR = "Calibri";   // fallback for Anova Bold
const FONT_BDY = "Calibri";   // fallback for Anova Light

// ─── Shared helpers ────────────────────────────────────────────────────────

function titleSlide(pres, line1, line2, sub) {
  let sl = pres.addSlide();
  // dark navy background
  sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.navy } });
  // blue accent bar left
  sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.blue } });

  sl.addText(line1, {
    x: 0.45, y: 1.6, w: 9.2, h: 0.75,
    fontFace: FONT_HDR, fontSize: 36, bold: true, color: C.white, margin: 0
  });
  sl.addText(line2, {
    x: 0.45, y: 2.4, w: 9.2, h: 0.65,
    fontFace: FONT_HDR, fontSize: 26, bold: false, color: C.ltBlue, margin: 0
  });
  if (sub) {
    sl.addText(sub, {
      x: 0.45, y: 3.25, w: 9.2, h: 0.45,
      fontFace: FONT_BDY, fontSize: 14, color: C.ltGray, margin: 0
    });
  }
  return sl;
}

function sectionHeader(sl, pres, title) {
  // pale blue top bar
  sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.55, fill: { color: C.navy } });
  sl.addText(title, {
    x: 0.3, y: 0.05, w: 9.4, h: 0.45,
    fontFace: FONT_HDR, fontSize: 20, bold: true, color: C.white, margin: 0
  });
}

function card(sl, pres, x, y, w, h, title, body, bgColor) {
  bgColor = bgColor || C.palBlue;
  sl.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bgColor },
    line: { color: C.ltBlue, width: 0.5 },
    rectRadius: 0.08
  });
  if (title) {
    sl.addText(title, {
      x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.32,
      fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0
    });
  }
  if (body) {
    sl.addText(body, {
      x: x + 0.12, y: y + (title ? 0.44 : 0.12), w: w - 0.24, h: h - (title ? 0.56 : 0.24),
      fontFace: FONT_BDY, fontSize: 10, color: C.navy, margin: 0, valign: "top"
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW presentation  —  sas-score-mcp-overview.pptx
// ══════════════════════════════════════════════════════════════════════════════
(function buildOverview() {
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "SAS Score MCP Server — Skills Overview";

  // ── Slide 1: Title ─────────────────────────────────────────────────────────
  titleSlide(pres,
    "SAS Score MCP Server",
    "Skills Architecture Overview",
    "Route · Verify · Score — five skills, one router"
  );

  // ── Slide 2: Target Audience ──────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Target Audience");

    // ── Card 1: SAS Users ──────────────────────────────────────────────────
    sl.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y: 0.75, w: 4.2, h: 3.8,
      fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.75 }, rectRadius: 0.1
    });
    // number badge
    sl.addShape(pres.ShapeType.ellipse, {
      x: 0.55, y: 0.88, w: 0.5, h: 0.5,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    sl.addText("1", {
      x: 0.55, y: 0.88, w: 0.5, h: 0.5,
      fontFace: FONT_HDR, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", margin: 0
    });
    sl.addText("SAS Users", {
      x: 1.15, y: 0.9, w: 3.2, h: 0.44,
      fontFace: FONT_HDR, fontSize: 18, bold: true, color: C.navy, margin: 0
    });
    sl.addText(
      'SAS users who want to use natural language (“chat”) to execute prebuilt SAS code and models.',
      {
        x: 0.6, y: 1.5, w: 3.8, h: 1.1,
        fontFace: FONT_BDY, fontSize: 12, color: C.navy, margin: 0, valign: "top"
      }
    );
    sl.addText("See the Quick Reference for details.", {
      x: 0.6, y: 2.75, w: 3.8, h: 0.4,
      fontFace: FONT_BDY, fontSize: 11, italic: true, color: C.blue, margin: 0
    });

    // ── Card 2: MCP Tool Developers ───────────────────────────────────────
    sl.addShape(pres.ShapeType.roundRect, {
      x: 5.4, y: 0.75, w: 4.2, h: 3.8,
      fill: { color: C.navy }, line: { color: C.blue, width: 0.75 }, rectRadius: 0.1
    });
    // number badge
    sl.addShape(pres.ShapeType.ellipse, {
      x: 5.55, y: 0.88, w: 0.5, h: 0.5,
      fill: { color: C.ltBlue }, line: { color: C.ltBlue }
    });
    sl.addText("2", {
      x: 5.55, y: 0.88, w: 0.5, h: 0.5,
      fontFace: FONT_HDR, fontSize: 14, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0
    });
    sl.addText("MCP Tool Developers", {
      x: 6.15, y: 0.9, w: 3.2, h: 0.44,
      fontFace: FONT_HDR, fontSize: 16, bold: true, color: C.white, margin: 0
    });
    sl.addText(
      "SAS developers who want to extend the capabilities of the server with their own tools.",
      {
        x: 5.6, y: 1.5, w: 3.8, h: 1.1,
        fontFace: FONT_BDY, fontSize: 12, color: C.palBlue, margin: 0, valign: "top"
      }
    );
    sl.addText("See the Developer Guide for details.", {
      x: 5.6, y: 2.75, w: 3.8, h: 0.4,
      fontFace: FONT_BDY, fontSize: 11, italic: true, color: C.ltBlue, margin: 0
    });
  }

  // ── Slide 3: What are skills? ──────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "What Are Skills?");

    sl.addText(
      "Skills are structured decision-tree documents (SKILL.md) that guide an AI agent " +
      "through a scoring workflow — which tool to call, in what order, and how to handle errors.",
      { x: 0.4, y: 0.75, w: 9.2, h: 0.7, fontFace: FONT_BDY, fontSize: 13, color: C.navy, margin: 0 }
    );

    // three concept boxes
    const concepts = [
      { t: "Router", b: "score-strategy reads the request and delegates to exactly one specialist skill." },
      { t: "Specialist", b: "Each specialist skill knows the verify → score pattern for its model type." },
      { t: "Tool", b: "MCP tools are the leaf operations — network calls to SAS Viya." },
    ];
    concepts.forEach((c, i) => {
      card(sl, pres, 0.4 + i * 3.1, 1.6, 2.9, 1.5, c.t, c.b, i === 0 ? C.navy : C.palBlue);
      if (i === 0) {
        // white text for navy card
        sl.addText(c.t, { x: 0.52, y: 1.7, w: 2.66, h: 0.32, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.white, margin: 0 });
        sl.addText(c.b, { x: 0.52, y: 2.04, w: 2.66, h: 1.0, fontFace: FONT_BDY, fontSize: 10, color: C.palBlue, margin: 0, valign: "top" });
      }
    });

    // arrow between router and specialist
    sl.addShape(pres.ShapeType.rightArrow, {
      x: 3.3, y: 2.0, w: 0.5, h: 0.6,
      fill: { color: C.blue }, line: { color: C.blue }
    });
    sl.addShape(pres.ShapeType.rightArrow, {
      x: 6.4, y: 2.0, w: 0.5, h: 0.6,
      fill: { color: C.blue }, line: { color: C.blue }
    });

    sl.addText("Skills remove ambiguity from the AI — the agent follows the decision tree, not its training data.", {
      x: 0.4, y: 3.4, w: 9.2, h: 0.5,
      fontFace: FONT_BDY, fontSize: 12, italic: true, color: C.gray, margin: 0
    });
  }

  // ── Slide 3: Five skills at a glance ───────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Five Skills at a Glance");

    const skills = [
      { name: "score-strategy", role: "Router", desc: "Entry point. Classifies model type from the request and delegates to the correct specialist skill.", color: C.navy, textColor: C.white, bodyColor: C.palBlue },
      { name: "score-mas-scr",  role: "MAS · SCR",     desc: "Handles MAS (default) and SCR models.\nFind → Score pattern with verification.", color: C.palBlue, textColor: C.navy, bodyColor: C.navy },
      { name: "score-job-jobdef", role: "Job · JobDef", desc: "Handles Job and JobDef model types.\nFind → Score pattern with verification.", color: C.palBlue, textColor: C.navy, bodyColor: C.navy },
      { name: "score-program",  role: "SAS · Macro",   desc: "Handles SAS Program (.sas) and Macro.\nDirect execution — no verify step.", color: C.palBlue, textColor: C.navy, bodyColor: C.navy },
      { name: "score-cas",      role: "CAS",            desc: "Handles CAS Program (.casl) and CAS Model tables.\nTwo model forms: inline src or casmodel table.", color: C.blue, textColor: C.white, bodyColor: C.palBlue },
    ];

    skills.forEach((sk, i) => {
      let x = 0.3, y = 0.7 + i * 0.92, w = 9.4, h = 0.84;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: sk.color }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.07 });
      // role badge
      sl.addShape(pres.ShapeType.roundRect, { x: x + 0.12, y: y + 0.14, w: 1.1, h: 0.3, fill: { color: sk.color === C.navy || sk.color === C.blue ? C.ltBlue : C.navy }, rectRadius: 0.04 });
      sl.addText(sk.role, { x: x + 0.12, y: y + 0.14, w: 1.1, h: 0.3, fontFace: FONT_BDY, fontSize: 9, bold: true, color: C.white, align: "center", margin: 0 });
      // name
      sl.addText(sk.name, { x: x + 1.3, y: y + 0.1, w: 2.8, h: 0.32, fontFace: FONT_HDR, fontSize: 13, bold: true, color: sk.textColor, margin: 0 });
      // desc
      sl.addText(sk.desc, { x: x + 4.2, y: y + 0.1, w: 5.0, h: 0.65, fontFace: FONT_BDY, fontSize: 10, color: sk.textColor, margin: 0, valign: "middle" });
    });
  }

  // ── Slide 4: Routing table ─────────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "score-strategy — Routing Rules");

    const rows = [
      { suffix: ".mas  (or no suffix)", type: "MAS",          skill: "score-mas-scr",   highlight: false },
      { suffix: ".scr",                 type: "SCR",          skill: "score-mas-scr",   highlight: false },
      { suffix: ".job",                 type: "Job",          skill: "score-job-jobdef", highlight: false },
      { suffix: ".jobdef",              type: "JobDef",       skill: "score-job-jobdef", highlight: false },
      { suffix: ".sas",                 type: "SAS Program",  skill: "score-program",   highlight: false },
      { suffix: "macro name",           type: "Macro",        skill: "score-program",   highlight: false },
      { suffix: ".casl",                type: "CAS Program",  skill: "score-cas",        highlight: false },
      { suffix: 'lib.table  +  "cas model"',  type: "CAS Model", skill: "score-cas",    highlight: false },
    ];

    // header row
    const cols = [{ label: "Model Suffix / Signal", x: 0.35, w: 3.3 }, { label: "Model Type", x: 3.75, w: 2.2 }, { label: "Skill", x: 6.05, w: 3.6 }];
    cols.forEach(c => {
      sl.addShape(pres.ShapeType.rect, { x: c.x, y: 0.62, w: c.w, h: 0.38, fill: { color: C.navy } });
      sl.addText(c.label, { x: c.x + 0.08, y: 0.64, w: c.w - 0.16, h: 0.34, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.white, margin: 0, valign: "middle" });
    });

    rows.forEach((row, i) => {
      let y = 1.05 + i * 0.54;
      let bg = row.highlight ? C.palBlue : (i % 2 === 0 ? "F4F8FF" : C.white);
      let tc = C.navy;

      sl.addShape(pres.ShapeType.rect, { x: 0.35, y, w: 9.3, h: 0.5, fill: { color: bg } });
      sl.addText(row.suffix, { x: 0.43, y, w: 3.22, h: 0.5, fontFace: "Consolas", fontSize: 10, color: row.highlight ? C.blue : tc, bold: row.highlight, margin: 0, valign: "middle" });
      sl.addText(row.type,   { x: 3.83, y, w: 2.12, h: 0.5, fontFace: FONT_BDY, fontSize: 10, color: tc, margin: 0, valign: "middle" });
      sl.addText(row.skill,  { x: 6.13, y, w: 3.44, h: 0.5, fontFace: "Consolas", fontSize: 10, color: row.highlight ? C.blue : tc, bold: row.highlight, margin: 0, valign: "middle" });
    });

  }

  // ── Slide 5: score-cas deep-dive ───────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "score-cas  —  Skill Deep Dive");

    // concept: two model forms
    sl.addText("The model can take two forms — both handled by one tool:", {
      x: 0.4, y: 0.7, w: 9.2, h: 0.4, fontFace: FONT_BDY, fontSize: 13, color: C.navy, margin: 0
    });

    // form 1
    sl.addShape(pres.ShapeType.roundRect, { x: 0.4, y: 1.2, w: 4.4, h: 2.0, fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.1 });
    sl.addText("Form 1 — Inline Src Code", { x: 0.55, y: 1.25, w: 4.1, h: 0.35, fontFace: FONT_HDR, fontSize: 12, bold: true, color: C.navy, margin: 0 });
    sl.addText("User provides CASL code directly.", { x: 0.55, y: 1.62, w: 4.1, h: 0.3, fontFace: FONT_BDY, fontSize: 10, color: C.navy, margin: 0 });
    sl.addShape(pres.ShapeType.rect, { x: 0.55, y: 1.95, w: 4.1, h: 0.85, fill: { color: "EBF3FF" }, line: { color: C.ltBlue, width: 0.3 } });
    sl.addText('{ src: "action echo;", scenario: {...}, output, limit }', {
      x: 0.62, y: 1.98, w: 3.96, h: 0.79, fontFace: "Consolas", fontSize: 9.5, color: C.navy, margin: 0, valign: "middle"
    });

    // form 2
    sl.addShape(pres.ShapeType.roundRect, { x: 5.2, y: 1.2, w: 4.4, h: 2.0, fill: { color: C.palBlue }, line: { color: C.blue, width: 1 }, rectRadius: 0.1 });
    sl.addText("Form 2 — CAS Model Table", { x: 5.35, y: 1.25, w: 4.1, h: 0.35, fontFace: FONT_HDR, fontSize: 12, bold: true, color: C.navy, margin: 0 });
    sl.addText("Persisted model table in CAS (lib.table + optional name).", { x: 5.35, y: 1.62, w: 4.1, h: 0.3, fontFace: FONT_BDY, fontSize: 10, color: C.navy, margin: 0 });
    sl.addShape(pres.ShapeType.rect, { x: 5.35, y: 1.95, w: 4.1, h: 0.85, fill: { color: "EBF3FF" }, line: { color: C.blue, width: 0.3 } });
    sl.addText('{ casmodel: "mylib.abc", name: "opt", scenario: {...} }', {
      x: 5.42, y: 1.98, w: 3.96, h: 0.79, fontFace: "Consolas", fontSize: 9.5, color: C.navy, margin: 0, valign: "middle"
    });

    // converge arrow to tool
    sl.addShape(pres.ShapeType.downArrow, { x: 2.0, y: 3.28, w: 0.7, h: 0.4, fill: { color: C.ltBlue }, line: { color: C.ltBlue } });
    sl.addShape(pres.ShapeType.downArrow, { x: 7.0, y: 3.28, w: 0.7, h: 0.4, fill: { color: C.blue }, line: { color: C.blue } });

    sl.addShape(pres.ShapeType.roundRect, { x: 2.8, y: 3.75, w: 4.4, h: 0.65, fill: { color: C.blue }, line: { color: C.blue }, rectRadius: 0.08 });
    sl.addText("sas-score-cas-program-score", {
      x: 2.8, y: 3.75, w: 4.4, h: 0.65, fontFace: "Consolas", fontSize: 13, bold: true, color: C.white, align: "center", margin: 0, valign: "middle"
    });
    sl.addText("No verify step — executes directly", {
      x: 2.8, y: 4.48, w: 4.4, h: 0.3, fontFace: FONT_BDY, fontSize: 10, italic: true, color: C.gray, align: "center", margin: 0
    });
  }

  // ── Slide 6: read-strategy ─────────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "*read-strategy  —  Reading Tables from SAS Viya");

    // intro line
    sl.addText("Determines whether to use raw row reads or SQL aggregation, and how to parse row-count requests.", {
      x: 0.35, y: 0.68, w: 9.3, h: 0.38,
      fontFace: FONT_BDY, fontSize: 12, color: C.navy, margin: 0
    });

    // ── Decision tree ──────────────────────────────────────────────────────
    // Step 1: verify
    sl.addShape(pres.ShapeType.roundRect, { x: 0.35, y: 1.14, w: 9.3, h: 0.52, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.07 });
    sl.addText("1  Verify table exists first  →  sas-score-find-table  (do not check library separately)", {
      x: 0.5, y: 1.14, w: 9.0, h: 0.52,
      fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.white, margin: 0, valign: "middle"
    });

    // Decision diamond (simulated as rotated rect / chevron shape)
    sl.addText("Does the request need aggregation (COUNT/SUM/AVG/GROUP BY) or a JOIN?", {
      x: 1.2, y: 1.82, w: 7.6, h: 0.42,
      fontFace: FONT_BDY, fontSize: 12, italic: true, color: C.navy, align: "center", margin: 0
    });

    // YES branch → sas-query
    sl.addShape(pres.ShapeType.roundRect, { x: 0.35, y: 2.4, w: 4.2, h: 1.38, fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.09 });
    sl.addText("YES  →  sas-score-sas-query", { x: 0.5, y: 2.45, w: 3.9, h: 0.32, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0 });
    sl.addText([
      { text: "COUNT, SUM, AVG, MIN, MAX\n", options: { bullet: true, breakLine: true } },
      { text: "GROUP BY / JOIN / computed columns", options: { bullet: true } },
    ], { x: 0.5, y: 2.82, w: 3.9, h: 0.86, fontFace: "Consolas", fontSize: 9.5, color: C.navy, margin: 0 });

    // NO branch → read-table
    sl.addShape(pres.ShapeType.roundRect, { x: 5.45, y: 2.4, w: 4.2, h: 1.38, fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.09 });
    sl.addText("NO  →  sas-score-read-table", { x: 5.6, y: 2.45, w: 3.9, h: 0.32, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0 });
    sl.addText([
      { text: "Raw rows, browsing, filtered reads\n", options: { bullet: true, breakLine: true } },
      { text: "WHERE clause alone  →  use where= param", options: { bullet: true } },
    ], { x: 5.6, y: 2.82, w: 3.9, h: 0.86, fontFace: "Consolas", fontSize: 9.5, color: C.navy, margin: 0 });

    // arrows
    sl.addShape(pres.ShapeType.downArrow, { x: 2.2, y: 2.22, w: 0.7, h: 0.18, fill: { color: C.ltBlue }, line: { color: C.ltBlue } });
    sl.addShape(pres.ShapeType.downArrow, { x: 7.1, y: 2.22, w: 0.7, h: 0.18, fill: { color: C.ltBlue }, line: { color: C.ltBlue } });
    sl.addText("YES", { x: 1.6, y: 2.22, w: 0.55, h: 0.18, fontFace: FONT_BDY, fontSize: 9, bold: true, color: C.blue, margin: 0, valign: "middle" });
    sl.addText("NO",  { x: 7.82, y: 2.22, w: 0.45, h: 0.18, fontFace: FONT_BDY, fontSize: 9, bold: true, color: C.blue, margin: 0, valign: "middle" });

    // ── Row count parsing table ─────────────────────────────────────────────
    sl.addText("Row Count Parsing", { x: 0.35, y: 3.94, w: 3.0, h: 0.3, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0 });

    const rcRows = [
      { phrase: '"first N rows / records"',  start: "1",  limit: "N" },
      { phrase: '"top N rows"',              start: "1",  limit: "N" },
      { phrase: '"rows N to M"',             start: "N",  limit: "M−N+1" },
      { phrase: '"starting from row N"',     start: "N",  limit: "10" },
      { phrase: "(not specified)",           start: "1",  limit: "10" },
    ];
    const rcHdr = [{ label: "User says", x: 0.35, w: 4.6 }, { label: "start", x: 5.05, w: 1.5 }, { label: "limit", x: 6.65, w: 2.9 }];
    rcHdr.forEach(c => {
      sl.addShape(pres.ShapeType.rect, { x: c.x, y: 4.28, w: c.w, h: 0.3, fill: { color: C.navy } });
      sl.addText(c.label, { x: c.x + 0.08, y: 4.29, w: c.w - 0.16, h: 0.28, fontFace: FONT_HDR, fontSize: 9, bold: true, color: C.white, margin: 0, valign: "middle" });
    });
    rcRows.forEach((r, i) => {
      let y = 4.62 + i * 0.19;
      let bg = i % 2 === 0 ? "F4F8FF" : C.white;
      sl.addShape(pres.ShapeType.rect, { x: 0.35, y, w: 9.2, h: 0.18, fill: { color: bg } });
      sl.addText(r.phrase, { x: 0.43, y, w: 4.54, h: 0.18, fontFace: "Consolas", fontSize: 8.5, color: C.navy, margin: 0, valign: "middle" });
      sl.addText(r.start,  { x: 5.13, y, w: 1.42, h: 0.18, fontFace: FONT_BDY,  fontSize: 8.5, color: C.navy, margin: 0, valign: "middle" });
      sl.addText(r.limit,  { x: 6.73, y, w: 2.82, h: 0.18, fontFace: FONT_BDY,  fontSize: 8.5, color: C.navy, margin: 0, valign: "middle" });
    });
  }

  // ── Slide 7: Flow through skills ───────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "End-to-End Request Flow  —  Skills Working Together");

    // ── Top row: 5 flow stages across ─────────────────────────────────────
    // Stage boxes at y=0.75, h=0.8
    const STAGE_Y = 0.72, STAGE_H = 0.82;
    const stages = [
      { label: "User\nRequest",        color: C.gray,    tc: C.white },
      { label: "*request-routing\n(classify)",  color: C.navy,    tc: C.white },
      { label: "*score-strategy\n(route)",      color: C.blue,    tc: C.white },
      { label: "*specialist skill\n(verify+score)", color: C.ltBlue, tc: C.white },
      { label: "SAS Viya\n(result)",   color: C.navy,    tc: C.white },
    ];
    const SW = 1.72, GAP = 0.18, SX0 = 0.2;
    stages.forEach((s, i) => {
      let x = SX0 + i * (SW + GAP);
      sl.addShape(pres.ShapeType.roundRect, { x, y: STAGE_Y, w: SW, h: STAGE_H, fill: { color: s.color }, line: { color: s.color }, rectRadius: 0.08 });
      sl.addText(s.label, { x, y: STAGE_Y, w: SW, h: STAGE_H, fontFace: FONT_HDR, fontSize: 10, bold: true, color: s.tc, align: "center", margin: 0, valign: "middle" });
      if (i < stages.length - 1) {
        sl.addShape(pres.ShapeType.rightArrow, { x: x + SW + 0.02, y: STAGE_Y + 0.25, w: GAP + 0.06, h: 0.32, fill: { color: C.ltGray }, line: { color: C.ltGray } });
      }
    });

    // ── Classify branch (below request-routing) ────────────────────────────
    const CL_Y = 1.75;
    sl.addText("request-routing classifies the action:", {
      x: 0.3, y: CL_Y, w: 9.4, h: 0.3,
      fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0
    });

    const categories = [
      { label: "Score", sub: "→ *score-strategy\n→ specialist skill\n→ scoring tool", color: C.navy, tc: C.white },
      { label: "Read / Query", sub: "→ *read-strategy\n→ read-table or sas-query", color: C.blue, tc: C.white },
      { label: "Find / Verify", sub: "→ *find-resources\n→ find-* tool", color: C.ltBlue, tc: C.white },
      { label: "List / Describe", sub: "→ *list-resource / *detail-strategy\n→ list-* or describe tool", color: C.palBlue, tc: C.navy },
    ];
    categories.forEach((c, i) => {
      let x = 0.2 + i * 2.42, y = CL_Y + 0.38, w = 2.3, h = 1.55;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: c.color }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.08 });
      sl.addText(c.label, { x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.32, fontFace: FONT_HDR, fontSize: 12, bold: true, color: c.tc, margin: 0 });
      sl.addText(c.sub,   { x: x + 0.12, y: y + 0.48, w: w - 0.24, h: 0.95, fontFace: FONT_BDY, fontSize: 9.5, color: c.tc, margin: 0, valign: "top" });
    });

    // ── Score path detail (bottom) ─────────────────────────────────────────
    const SP_Y = 3.55;
    sl.addText("Score path detail  (score-strategy routing):", {
      x: 0.3, y: SP_Y, w: 9.4, h: 0.3,
      fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0
    });

    const scoreSkills = [
      { label: "*score-mas-scr",     sub: "MAS · SCR",     tools: "find-mas / mas-score\nfind-scr / scr-score" },
      { label: "*score-job-jobdef",  sub: "Job · JobDef",  tools: "find-job / job-score\nfind-jobdef / jobdef-score" },
      { label: "*score-program",     sub: "SAS · Macro",   tools: "program-score\nscore-macro" },
      { label: "*score-cas",         sub: "CAS",           tools: "cas-program-score\n(inline or table)" },
    ];
    scoreSkills.forEach((sk, i) => {
      let x = 0.2 + i * 2.42, y = SP_Y + 0.38, w = 2.3, h = 1.48;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: "F0F5FF" }, line: { color: C.ltBlue, width: 0.8 }, rectRadius: 0.08 });
      // skill name bar
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.38, fill: { color: C.ltBlue }, line: { color: C.ltBlue }, rectRadius: 0.08 });
      sl.addText(sk.label, { x: x + 0.08, y: y + 0.03, w: w - 0.16, h: 0.32, fontFace: FONT_HDR, fontSize: 9, bold: true, color: C.white, margin: 0, valign: "middle" });
      sl.addText(sk.sub,   { x: x + 0.1, y: y + 0.44, w: w - 0.2, h: 0.28, fontFace: FONT_BDY, fontSize: 9.5, color: C.navy, margin: 0 });
      sl.addShape(pres.ShapeType.rect, { x: x + 0.1, y: y + 0.76, w: w - 0.2, h: 0.62, fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.3 } });
      sl.addText(sk.tools, { x: x + 0.14, y: y + 0.78, w: w - 0.28, h: 0.58, fontFace: "Consolas", fontSize: 8.5, color: C.navy, margin: 0, valign: "middle" });
    });

    // Legend
    sl.addShape(pres.ShapeType.roundRect, { x: 9.68, y: SP_Y + 0.35, w: 0.02, h: 1.5, fill: { color: C.white }, line: { color: C.white } }); // spacer
    sl.addText([
      { text: "*", options: { bold: true, color: C.blue } },
      { text: " = skill", options: { color: C.gray } },
    ], { x: 0.3, y: 5.3, w: 2.5, h: 0.25, fontFace: FONT_BDY, fontSize: 9.5, margin: 0 });
  }

  pres.writeFile({ fileName: "sas-score-mcp-overview.pptx" }).then(() => console.log("overview done"));
})();


// ══════════════════════════════════════════════════════════════════════════════
// WORKFLOW presentation  —  sas-score-mcp-workflow.pptx
// ══════════════════════════════════════════════════════════════════════════════
(function buildWorkflow() {
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "SAS Score MCP Server — Workflow";

  // ── Slide 1: Title ─────────────────────────────────────────────────────────
  titleSlide(pres,
    "SAS Score MCP Server",
    "AI-Powered SAS Viya Integration Workflow",
    "Claude  ·  GitHub Copilot  ·  SAS Viya  ·  Model Context Protocol"
  );

  // ── Slide 2: End-to-End Architecture ──────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "End-to-End Architecture");

    const layers = [
      { label: "AI Agent",        sub: "Claude  ·  GitHub Copilot",                              color: C.navy,    tc: C.white },
      { label: "Skills Layer",    sub: "Request Routing  ·  Decision Trees  ·  Strategies",      color: C.blue,    tc: C.white },
      { label: "MCP Server",      sub: "Tool Registration  ·  Two-Tier Descriptions  ·  Cache",  color: C.ltBlue,  tc: C.navy  },
      { label: "Transport",       sub: "HTTP (Express + OAuth)   |   Stdio (CLI / Local)",        color: C.palBlue, tc: C.navy  },
      { label: "Tool Execution",  sub: "29 Tools: mas · scr · job · jobdef · program · cas · read", color: "EBF3FF", tc: C.navy },
      { label: "SAS Viya",        sub: "MAS  ·  SCR  ·  CAS Analytics  ·  Compute Jobs  ·  SCR Containers", color: C.navy, tc: C.white },
    ];

    layers.forEach((l, i) => {
      let y = 0.62 + i * 0.82;
      sl.addShape(pres.ShapeType.roundRect, { x: 0.4, y, w: 9.2, h: 0.74, fill: { color: l.color }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.06 });
      sl.addText(l.label, { x: 0.55, y: y + 0.06, w: 2.5, h: 0.3,  fontFace: FONT_HDR, fontSize: 12, bold: true, color: l.tc, margin: 0 });
      sl.addText(l.sub,   { x: 3.1,  y: y + 0.24, w: 6.4, h: 0.3,  fontFace: FONT_BDY, fontSize: 10, color: l.tc, margin: 0, valign: "middle" });
      if (i < layers.length - 1) {
        sl.addShape(pres.ShapeType.downArrow, { x: 4.65, y: y + 0.74, w: 0.7, h: 0.08, fill: { color: C.ltGray }, line: { color: C.ltGray } });
      }
    });
  }

  // ── Slide 3: Tool Catalog ─────────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Tool Catalog  (29 Tools)  —  prefix: sas-score-");

    const groups = [
      { title: "MAS Models",     color: C.navy,   tc: C.white,  tools: ["list-mas","find-mas","mas-describe","mas-score"] },
      { title: "SCR Models",     color: C.blue,   tc: C.white,  tools: ["list-scr","find-scr","scr-describe","scr-score"] },
      { title: "Job Models",     color: C.ltBlue, tc: C.navy,   tools: ["list-jobs","find-job","job-describe","job-score"] },
      { title: "JobDef Models",  color: C.palBlue,tc: C.navy,   tools: ["list-jobdefs","find-jobdef","jobdef-describe","jobdef-score"] },
      { title: "Libraries",      color: "F0F4F8", tc: C.navy,   tools: ["list-libraries","find-library"] },
      { title: "Tables",         color: "F0F4F8", tc: C.navy,   tools: ["list-tables","find-table","table-describe","read-table","sas-query"] },
      { title: "Program · Macro",color: "F0F4F8", tc: C.navy,   tools: ["program-score","score-macro"] },
      { title: "CAS Program",    color: C.blue,   tc: C.white,  tools: ["cas-program-score"] },
    ];

    const cols = 4;
    groups.forEach((g, i) => {
      let col = i % cols, row = Math.floor(i / cols);
      let x = 0.25 + col * 2.37, y = 0.68 + row * 2.38, w = 2.25, h = 2.2;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: g.color }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.08 });
      sl.addText(g.title, { x: x + 0.1, y: y + 0.1, w: w - 0.2, h: 0.32, fontFace: FONT_HDR, fontSize: 10, bold: true, color: g.tc, margin: 0 });
      g.tools.forEach((t, j) => {
        sl.addText(t, { x: x + 0.1, y: y + 0.48 + j * 0.34, w: w - 0.2, h: 0.3, fontFace: "Consolas", fontSize: 8.5, color: g.tc, margin: 0 });
      });
    });
  }

  // ── Slide 4: Skills Architecture ──────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Skills Architecture  —  Decision Trees as Canonical Spec");

    // ── router box (no containing rect — it has no tool children) ──
    sl.addShape(pres.ShapeType.roundRect, { x: 3.4, y: 0.68, w: 3.2, h: 0.72, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.08 });
    sl.addText("*score-strategy  (Router)", { x: 3.4, y: 0.68, w: 3.2, h: 0.72, fontFace: FONT_HDR, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0, valign: "middle" });

    // ── 4 specialist groups: each has a containing rect, a skill box, and tool box(es) ──
    // Layout: 4 equal columns, 2.3" wide each, gap 0.07", starting x=0.17
    const COL_X = [0.17, 2.54, 4.91, 7.28];
    const COL_W = 2.3;
    const GRP_Y = 1.58;   // top of containing rect
    const GRP_H = 2.28;   // height of containing rect
    const SK_Y  = 1.72;   // skill box top
    const SK_H  = 0.68;   // skill box height
    const TL_Y  = 2.60;   // tool row top
    const TL_H  = 0.68;   // tool box height

    const groups = [
      {
        skill: "*score-mas-scr", sub: "MAS · SCR", skillColor: C.ltBlue,
        tools: [
          { label: "find-mas\nmas-score",  dx: 0,    tw: 1.08 },
          { label: "find-scr\nscr-score",  dx: 1.14, tw: 1.08 },
        ]
      },
      {
        skill: "*score-job-jobdef", sub: "Job · JobDef", skillColor: C.ltBlue,
        tools: [
          { label: "find-job\njob-score",     dx: 0,    tw: 1.08 },
          { label: "find-jobdef\njobdef-score",dx: 1.14, tw: 1.08 },
        ]
      },
      {
        skill: "*score-program", sub: "SAS · Macro", skillColor: C.ltBlue,
        tools: [
          { label: "program-score\nscore-macro", dx: 0.05, tw: 2.2 },
        ]
      },
      {
        skill: "*score-cas", sub: "CAS", skillColor: C.blue,
        tools: [
          { label: "cas-program-score\n(inline or table)", dx: 0.05, tw: 2.2 },
        ]
      },
    ];

    groups.forEach((g, gi) => {
      let gx = COL_X[gi];
      // containing rect (light outline, no fill)
      sl.addShape(pres.ShapeType.roundRect, {
        x: gx - 0.05, y: GRP_Y, w: COL_W + 0.1, h: GRP_H,
        fill: { color: "F4F8FF" },
        line: { color: C.ltBlue, width: 1.0, dashType: "dash" },
        rectRadius: 0.1
      });
      // skill box
      sl.addShape(pres.ShapeType.roundRect, { x: gx, y: SK_Y, w: COL_W, h: SK_H, fill: { color: g.skillColor }, line: { color: g.skillColor }, rectRadius: 0.07 });
      sl.addText(g.skill + "\n" + g.sub, { x: gx, y: SK_Y, w: COL_W, h: SK_H, fontFace: FONT_HDR, fontSize: 9.5, bold: true, color: C.white, align: "center", margin: 0, valign: "middle" });
      // tool boxes
      g.tools.forEach(t => {
        let tx = gx + t.dx;
        sl.addShape(pres.ShapeType.roundRect, { x: tx, y: TL_Y, w: t.tw, h: TL_H, fill: { color: C.palBlue }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.06 });
        sl.addText(t.label, { x: tx, y: TL_Y, w: t.tw, h: TL_H, fontFace: "Consolas", fontSize: 7.5, color: C.navy, align: "center", margin: 0, valign: "middle" });
      });
    });

    // ── Legend ──
    sl.addShape(pres.ShapeType.roundRect, { x: 0.17, y: 3.48, w: 4.6, h: 0.34, fill: { color: "EEF4FF" }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.05 });
    sl.addText([
      { text: "*", options: { bold: true, color: C.blue } },
      { text: " = skill (SKILL.md decision tree)    ", options: { color: C.navy } },
      { text: "□ □", options: { color: C.palBlue, bold: true } },
      { text: " = MCP tools called by the skill", options: { color: C.navy } },
    ], { x: 0.3, y: 3.49, w: 4.34, h: 0.32, fontFace: FONT_BDY, fontSize: 10, margin: 0, valign: "middle" });

    // ── Two-Tier note ──
    sl.addText("Two-Tier Tool Descriptions:", { x: 0.17, y: 3.95, w: 2.3, h: 0.3, fontFace: FONT_HDR, fontSize: 10, bold: true, color: C.navy, margin: 0 });
    const tiers = [
      { label: "Standalone Mode", desc: "Full verbose descriptions, USE/DON'T USE rules, self-contained" },
      { label: "Agent Mode",      desc: "Lean ~10-line descriptions, skills handle routing" },
    ];
    tiers.forEach((t, i) => {
      sl.addShape(pres.ShapeType.roundRect, { x: 0.17 + i * 4.85, y: 4.3, w: 4.65, h: 0.9, fill: { color: i === 0 ? C.palBlue : "EBF3FF" }, line: { color: C.ltBlue, width: 0.5 }, rectRadius: 0.07 });
      sl.addText(t.label, { x: 0.3 + i * 4.85, y: 4.36, w: 4.4, h: 0.28, fontFace: FONT_HDR, fontSize: 10, bold: true, color: C.navy, margin: 0 });
      sl.addText(t.desc,  { x: 0.3 + i * 4.85, y: 4.66, w: 4.4, h: 0.44, fontFace: FONT_BDY, fontSize: 9.5, color: C.navy, margin: 0 });
    });
  }

  // ── Slide 5: Data Flow Example ────────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Data Flow Example  —  MAS Model Scoring");

    const steps = [
      { n: "1", label: "User Request",    detail: '"Score customer with churn model (age=45, income=60000)"' },
      { n: "2", label: "Skills Layer",    detail: "score-strategy routes to score-mas-scr via routing table" },
      { n: "3", label: "Verify",          detail: "find-mas confirms churnRisk model exists in SAS Viya" },
      { n: "4", label: "MCP Tool",        detail: "mas-score invoked with model name + scenario params" },
      { n: "5", label: "Helper / Restaf", detail: "_masScoring() → masSetup() → masDescribe() → masRun()" },
      { n: "6", label: "Result",          detail: '{ prediction: "churn", probability: 0.78, age: 45 }' },
    ];

    steps.forEach((s, i) => {
      let y = 0.68 + i * 0.79;
      sl.addShape(pres.ShapeType.ellipse, { x: 0.3, y: y + 0.04, w: 0.55, h: 0.55, fill: { color: i === 0 ? C.navy : (i === 5 ? C.blue : C.ltBlue) } });
      sl.addText(s.n, { x: 0.3, y: y + 0.04, w: 0.55, h: 0.55, fontFace: FONT_HDR, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0, valign: "middle" });
      sl.addText(s.label, { x: 1.0, y, w: 2.2, h: 0.35, fontFace: FONT_HDR, fontSize: 11, bold: true, color: C.navy, margin: 0 });
      sl.addShape(pres.ShapeType.rect, { x: 3.3, y: y + 0.02, w: 6.4, h: 0.58, fill: { color: "F4F8FF" }, line: { color: C.palBlue, width: 0.5 } });
      sl.addText(s.detail, { x: 3.42, y: y + 0.04, w: 6.18, h: 0.54, fontFace: "Consolas", fontSize: 9.5, color: C.navy, margin: 0, valign: "middle" });
      if (i < steps.length - 1) {
        sl.addShape(pres.ShapeType.line, { x: 0.57, y: y + 0.59, w: 0, h: 0.2, line: { color: C.ltGray, width: 1 } });
      }
    });
  }

  // ── Slide 6: Authentication Flows ─────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Authentication Flows");

    const auths = [
      { code: "oauth",       desc: "Full browser-based OAuth 2.0 with PKCE. Most secure.", color: C.navy,   tc: C.white },
      { code: "oauthclient", desc: "OAuth where the client app manages token exchange.",    color: C.navy,   tc: C.white },
      { code: "bearer",      desc: "Pass a valid SAS Viya access token directly.",          color: C.blue,   tc: C.white },
      { code: "token",       desc: "Load access token from a local file path.",             color: C.blue,   tc: C.white },
      { code: "sascli",      desc: "Use auth from an existing sas-viya-cli profile.",       color: C.ltGray, tc: C.navy  },
      { code: "password",    desc: "Direct credential auth. Use with care.",                color: C.ltGray, tc: C.navy  },
    ];

    const cols = 3;
    auths.forEach((a, i) => {
      let col = i % cols, row = Math.floor(i / cols);
      let x = 0.3 + col * 3.15, y = 0.72 + row * 2.3, w = 3.0, h = 2.1;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: a.color }, line: { color: C.ltGray, width: 0.5 }, rectRadius: 0.1 });
      sl.addText(a.code, { x: x + 0.15, y: y + 0.22, w: w - 0.3, h: 0.55, fontFace: "Consolas", fontSize: 22, bold: true, color: a.tc, margin: 0 });
      sl.addText(a.desc, { x: x + 0.15, y: y + 0.88, w: w - 0.3, h: 1.05, fontFace: FONT_BDY, fontSize: 10.5, color: a.tc, margin: 0, valign: "top" });
    });
  }

  // ── Slide 7: Deployment Options ───────────────────────────────────────────
  {
    let sl = pres.addSlide();
    sl.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.white } });
    sectionHeader(sl, pres, "Deployment Options");

    // Two boxes side by side, centered
    const deploys = [
      {
        title: "Local CLI",
        sub: "Stdio Transport  ·  HTTP Transport",
        cmd: "npx @sassoftware/sas-score-mcp-serverjs",
        bullets: [
          "No global install needed",
          "Stdio: Claude Desktop & VS Code (local config)",
          "HTTP: any browser-based AI agent",
          "Note: Claude.ai does not support localhost HTTP",
        ],
        color: C.navy, tc: C.white
      },
      {
        title: "Docker Container",
        sub: "HTTP Transport  ·  OAuth",
        cmd: "ghcr.io/sassoftware/sas-score-mcp-serverjs:latest",
        bullets: [
          "Pull from GitHub Container Registry",
          "HTTP server on port 8080",
          "Multi-user concurrent support",
          "Deploy anywhere Docker runs",
        ],
        color: C.blue, tc: C.white
      },
    ];

    deploys.forEach((d, i) => {
      let x = 0.5 + i * 4.75, y = 0.68, w = 4.5, h = 4.7;
      sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: d.color }, line: { color: C.ltGray, width: 0.3 }, rectRadius: 0.1 });
      sl.addText(d.title, { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.4, fontFace: FONT_HDR, fontSize: 16, bold: true, color: d.tc, margin: 0 });
      sl.addText(d.sub,   { x: x + 0.2, y: y + 0.58, w: w - 0.4, h: 0.3, fontFace: FONT_BDY, fontSize: 11, color: d.tc, margin: 0 });
      sl.addShape(pres.ShapeType.rect, { x: x + 0.2, y: y + 0.96, w: w - 0.4, h: 0.44, fill: { color: "1A4070" }, line: { color: C.ltBlue, width: 0.5 } });
      sl.addText(d.cmd, { x: x + 0.25, y: y + 0.98, w: w - 0.5, h: 0.4, fontFace: "Consolas", fontSize: 8.5, color: d.tc, margin: 0, valign: "middle" });
      d.bullets.forEach((b, j) => {
        sl.addText([{ text: b, options: { bullet: true } }], {
          x: x + 0.2, y: y + 1.55 + j * 0.72, w: w - 0.4, h: 0.64,
          fontFace: FONT_BDY, fontSize: 10.5, color: d.tc, margin: 0
        });
      });
    });
  }

  pres.writeFile({ fileName: "sas-score-mcp-workflow.pptx" }).then(() => console.log("workflow done"));
})();
