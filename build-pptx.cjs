// build-pptx.js  —  Rebuild sas-score-mcp-workflow.pptx
// Run: node build-pptx.js

const pptxgen = require("pptxgenjs");

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:    "1A2B4A",
  blue:    "0074BE",
  teal:    "00A89D",
  tealDk: "007A73",
  silver:  "F0F4F8",
  slate:   "5A6A7A",
  white:   "FFFFFF",
  offwhite:"F7F9FC",
  text:    "1A2B4A",
  muted:   "6B7A8D",
};

const FONT = "Calibri";
const makeShadow = () => ({ type:"outer", color:"000000", blur:8, offset:3, angle:135, opacity:0.12 });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hdr(slide, title) {
  // Coloured top bar
  slide.addShape("rect", { x:0, y:0, w:10, h:0.55, fill:{color:C.navy}, line:{color:C.navy} });
  slide.addText(title, {
    x:0.35, y:0, w:9.3, h:0.55, margin:0,
    fontFace:FONT, fontSize:20, bold:true, color:C.white, valign:"middle"
  });
}

function pill(slide, label, x, y, w, h, bg, fg) {
  slide.addShape("rect", { x, y, w, h,
    fill:{color:bg}, line:{color:bg}, shadow:makeShadow() });
  slide.addText(label, {
    x, y, w, h, margin:0,
    fontFace:FONT, fontSize:10, bold:false, color:fg, align:"center", valign:"middle"
  });
}

function card(slide, title, items, x, y, w, h, accent) {
  // Card background
  slide.addShape("rect", { x, y, w, h,
    fill:{color:C.white}, line:{color:"E2E8F0", pt:1}, shadow:makeShadow() });
  // Accent top bar
  slide.addShape("rect", { x, y, w:w, h:0.28, fill:{color:accent}, line:{color:accent} });
  // Title
  slide.addText(title, {
    x:x+0.12, y:y, w:w-0.12, h:0.28, margin:0,
    fontFace:FONT, fontSize:11, bold:true, color:C.white, valign:"middle"
  });
  // Items
  const rows = items.map(t => ({ text:t, options:{ bullet:true, breakLine:true } }));
  rows[rows.length-1].options.breakLine = false;
  slide.addText(rows, {
    x:x+0.12, y:y+0.32, w:w-0.2, h:h-0.38,
    fontFace:FONT, fontSize:10, color:C.text,
    paraSpaceAfter:2
  });
}

// ─── Presentation ─────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.author  = "SAS Institute";
pres.title   = "SAS Score MCP Server";

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Teal accent bar (left edge)
  s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{color:C.teal}, line:{color:C.teal} });

  // Top badge row
  s.addShape("rect", { x:0.4, y:0.35, w:1.5, h:0.32,
    fill:{color:C.teal}, line:{color:C.teal} });
  s.addText("MCP  ·  NODE.JS", {
    x:0.4, y:0.35, w:1.5, h:0.32, margin:0,
    fontFace:FONT, fontSize:10, bold:true, color:C.white, align:"center", valign:"middle"
  });

  // Main title
  s.addText("SAS Score MCP Server", {
    x:0.4, y:1.05, w:9.2, h:1.3,
    fontFace:FONT, fontSize:48, bold:true, color:C.white
  });

  // Subtitle
  s.addText("AI-Powered SAS Viya Integration Workflow", {
    x:0.4, y:2.45, w:9.2, h:0.55,
    fontFace:FONT, fontSize:22, bold:false, color:"CADCFC"
  });

  // Divider
  s.addShape("rect", { x:0.4, y:3.1, w:3.5, h:0.04, fill:{color:C.teal}, line:{color:C.teal} });

  // Tech badges
  const badges = ["Claude", "GitHub Copilot", "SAS Viya", "Model Context Protocol"];
  let bx = 0.4;
  for (const b of badges) {
    const bw = b.length * 0.092 + 0.3;
    s.addShape("rect", { x:bx, y:3.28, w:bw, h:0.3,
      fill:{color:"FFFFFF", transparency:85}, line:{color:"FFFFFF", pt:1, transparency:60} });
    s.addText(b, {
      x:bx, y:3.28, w:bw, h:0.3, margin:0,
      fontFace:FONT, fontSize:10, color:C.white, align:"center", valign:"middle"
    });
    bx += bw + 0.15;
  }

  // Tagline
  s.addText("Route · Verify · Score · Describe · Read", {
    x:0.4, y:4.8, w:9.2, h:0.4,
    fontFace:FONT, fontSize:13, color:"8BAFD4", italic:true
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — End-to-End Architecture
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  hdr(s, "End-to-End Architecture");

  const layers = [
    { label:"AI Agent",           sub:"Claude  ·  GitHub Copilot",                          bg:C.navy,   fg:C.white  },
    { label:"Skills Layer",       sub:"Request Routing  ·  Decision Trees  ·  Strategies",  bg:C.blue,   fg:C.white  },
    { label:"MCP Server (Node.js)",sub:"Tool Registration  ·  Two-Tier Descriptions  ·  Session Cache", bg:C.teal, fg:C.white },
    { label:"Transport",          sub:"HTTP (Express + OAuth)   |   Stdio (CLI / Local)",    bg:"5A6A7A", fg:C.white  },
    { label:"Tool Execution",     sub:"28 Tools: mas-score · scr-score · job-score · jobdef-score · program-score · cas-program-score · read-table …", bg:"3A5070", fg:C.white },
    { label:"SAS Viya",           sub:"MAS Model Scoring  ·  CAS Analytics  ·  Compute Jobs  ·  SCR Containers", bg:"0D1F35", fg:"CADCFC" },
  ];

  const LH = 0.66;
  let ly = 0.68;
  for (const l of layers) {
    s.addShape("rect", { x:0.4, y:ly, w:9.2, h:LH,
      fill:{color:l.bg}, line:{color:l.bg}, shadow:makeShadow() });
    s.addText(l.label, {
      x:0.58, y:ly+0.05, w:2.6, h:0.3, margin:0,
      fontFace:FONT, fontSize:12, bold:true, color:l.fg, valign:"middle"
    });
    s.addText(l.sub, {
      x:3.2, y:ly+0.05, w:6.2, h:0.56, margin:0,
      fontFace:FONT, fontSize:11, color:l.fg, valign:"middle"
    });
    // Connector arrow (except last)
    if (l !== layers[layers.length-1]) {
      s.addShape("rect", { x:4.85, y:ly+LH, w:0.3, h:0.07,
        fill:{color:C.teal}, line:{color:C.teal} });
    }
    ly += LH + 0.07;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Tool Catalog
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  hdr(s, "Tool Catalog  (28 Tools)");

  // Row 1 — Analytical + Execution model cards
  const cols = [
    {
      title:"MAS Models", accent:C.blue,
      items:["list-mas","find-mas","mas-describe","mas-score"]
    },
    {
      title:"SCR Models", accent:C.teal,
      items:["list-scr","find-scr","scr-describe","scr-score"]
    },
    {
      title:"Job Models", accent:"3A5070",
      items:["list-jobs","find-job","job-describe","job-score"]
    },
    {
      title:"JobDef Models", accent:"5A6A7A",
      items:["list-jobdefs","find-jobdef","jobdef-describe","jobdef-score"]
    },
  ];

  // Row 2 — Data + Program model cards
  const cols2 = [
    {
      title:"Libraries", accent:C.navy,
      items:["list-libraries","find-library"]
    },
    {
      title:"Tables", accent:"2E6DA4",
      items:["list-tables","find-table","table-describe","read-table","sas-query"]
    },
    {
      title:"Program Models", accent:"00756B",
      items:["program-score","cas-program-score","macro-score"]
    },
  ];

  // Row 1 — 4 model cards
  const CW = 2.2, CH = 1.35, CY = 0.68, GAP = 0.06;
  let cx = 0.35;
  for (const c of cols) {
    card(s, c.title, c.items, cx, CY, CW, CH, c.accent);
    cx += CW + GAP;
  }

  // Row 2 — 3 data cards
  const CW2 = 3.0, CH2 = 1.45, CY2 = 2.2;
  const row2starts = [0.35, 3.5, 6.65];
  for (let i=0; i<cols2.length; i++) {
    const c = cols2[i];
    const w = i === 1 ? 3.05 : 2.9;
    card(s, c.title, c.items, row2starts[i], CY2, w, CH2, c.accent);
  }

  // Note
  s.addText("All tools prefixed sas-score-  (e.g. sas-score-mas-score)  ·  Job, JobDef, Program, and CAS Program are all model types  ·  Standalone and agent modes", {
    x:0.35, y:3.82, w:9.3, h:0.3,
    fontFace:FONT, fontSize:9.5, color:C.muted, italic:true, align:"center"
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Decision Tree Architecture
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  hdr(s, "Skills Architecture  ·  Decision Trees as Canonical Spec");

  // ── Pipeline row: YAML → Script → SKILL.md ──────────────────────────────
  const pipeY = 0.75, pH = 0.95, pW = 2.5;
  const pipes = [
    { title:"Decision-Tree YAMLs", sub:"7 resource trees\n(mas · scr · job · jobdef\ntable · library · program)", bg:C.navy },
    { title:"gen-routing.js", sub:"Reads YAMLs\nGenerates routing tables\nDetects primitive usage", bg:C.blue },
    { title:"SKILL.md  (generated)", sub:"Routing table · Resolve rules\nDescribe table · Score table\nPrimitives reference", bg:C.teal },
  ];

  const pipeXs = [0.38, 3.75, 7.12];
  for (let i=0; i<pipes.length; i++) {
    const p = pipes[i];
    s.addShape("rect", { x:pipeXs[i], y:pipeY, w:pW, h:pH,
      fill:{color:p.bg}, line:{color:p.bg}, shadow:makeShadow() });
    s.addText(p.title, {
      x:pipeXs[i]+0.12, y:pipeY+0.06, w:pW-0.2, h:0.28, margin:0,
      fontFace:FONT, fontSize:11, bold:true, color:C.white, valign:"middle"
    });
    s.addText(p.sub, {
      x:pipeXs[i]+0.12, y:pipeY+0.36, w:pW-0.2, h:pH-0.42, margin:0,
      fontFace:FONT, fontSize:9.5, color:"D0E8FF", valign:"top"
    });
    // Arrow between boxes
    if (i < pipes.length-1) {
      const ax = pipeXs[i] + pW + 0.05;
      s.addShape("rect",     { x:ax,      y:pipeY+(pH/2)-0.04, w:0.45, h:0.07, fill:{color:C.teal}, line:{color:C.teal} });
      s.addShape("triangle", { x:ax+0.38, y:pipeY+(pH/2)-0.13, w:0.2,  h:0.26, fill:{color:C.teal}, line:{color:C.teal} });
    }
  }

  // Label row: npm run gen:routing
  s.addText("npm run gen:routing  ·  npm run check:routing  (CI validation)", {
    x:3.0, y:pipeY+pH+0.1, w:4.0, h:0.28,
    fontFace:FONT, fontSize:9.5, color:C.teal, align:"center", bold:true
  });

  // ── Two-tier descriptions ─────────────────────────────────────────────────
  const tierY = 2.35;
  s.addText("Two-Tier Tool Descriptions", {
    x:0.38, y:tierY, w:9.3, h:0.3, margin:0,
    fontFace:FONT, fontSize:13, bold:true, color:C.navy
  });

  const tiers = [
    {
      label:"Standalone Mode", flag:"node cli.js",
      desc:"Full verbose descriptions\nUSE / DON'T USE rules\nRouting examples & negative examples\nSelf-contained — no skills needed",
      bg:C.navy, accent:C.blue
    },
    {
      label:"Agent Mode", flag:"node cli.js --agent",
      desc:"Lean descriptions (~10 lines)\nParameter list + return value only\nSkills + Decision Trees handle routing\nFewer tokens, cleaner context window",
      bg:C.teal, accent:C.tealDk
    },
  ];

  for (let i=0; i<tiers.length; i++) {
    const t = tiers[i];
    const tx = 0.38 + i*4.8, tw = 4.55, th = 1.7;
    s.addShape("rect", { x:tx, y:tierY+0.38, w:tw, h:th,
      fill:{color:t.bg}, line:{color:t.bg}, shadow:makeShadow() });
    s.addShape("rect", { x:tx, y:tierY+0.38, w:tw, h:0.3,
      fill:{color:t.accent}, line:{color:t.accent} });
    s.addText(t.label, {
      x:tx+0.12, y:tierY+0.38, w:tw-0.7, h:0.3, margin:0,
      fontFace:FONT, fontSize:11, bold:true, color:C.white, valign:"middle"
    });
    s.addShape("rect", { x:tx+tw-1.4, y:tierY+0.41, w:1.3, h:0.24,
      fill:{color:"FFFFFF", transparency:85}, line:{color:C.white, pt:1, transparency:60} });
    s.addText(t.flag, {
      x:tx+tw-1.4, y:tierY+0.41, w:1.3, h:0.24, margin:0,
      fontFace:"Consolas", fontSize:8, color:C.white, align:"center", valign:"middle"
    });
    const dRows = t.desc.split("\n").map((d,i2) => ({
      text:d, options:{ bullet:true, breakLine: i2 < t.desc.split("\n").length-1 }
    }));
    s.addText(dRows, {
      x:tx+0.15, y:tierY+0.76, w:tw-0.25, h:th-0.44,
      fontFace:FONT, fontSize:10, color:C.white, paraSpaceAfter:3
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Data Flow: Model Scoring
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  hdr(s, "Data Flow Example  ·  Model Scoring");

  const steps = [
    { n:"1", title:"User Request",     detail:'"Score customer with churn model  (age=45, income=60000)"',      bg:C.navy },
    { n:"2", title:"Skills Layer",     detail:"score-strategy skill routes to mas-score via decision tree",      bg:C.blue },
    { n:"3", title:"Verify",           detail:"find-mas confirms churnRisk model exists in SAS Viya",            bg:"2E6DA4" },
    { n:"4", title:"MCP Tool",         detail:"mas-score tool invoked with model name + scenario",               bg:C.teal },
    { n:"5", title:"Helper / Restaf",  detail:"_masScoring() → masSetup() → masDescribe() → masRun()",         bg:C.tealDk },
    { n:"6", title:"Result",           detail:'{ prediction:"churn", probability:0.78, age:45, income:60000 }', bg:"0D4F3A" },
  ];

  const SW = 9.2, SH = 0.58, SX = 0.4;
  let sy = 0.68;
  for (let i=0; i<steps.length; i++) {
    const st = steps[i];
    s.addShape("rect", { x:SX, y:sy, w:SW, h:SH,
      fill:{color:st.bg}, line:{color:st.bg}, shadow:makeShadow() });
    // Number bubble
    s.addShape("oval", { x:SX+0.1, y:sy+0.09, w:0.4, h:0.4,
      fill:{color:C.teal}, line:{color:C.teal} });
    s.addText(st.n, {
      x:SX+0.1, y:sy+0.09, w:0.4, h:0.4, margin:0,
      fontFace:FONT, fontSize:11, bold:true, color:C.white, align:"center", valign:"middle"
    });
    s.addText(st.title, {
      x:SX+0.62, y:sy+0.06, w:1.8, h:0.46, margin:0,
      fontFace:FONT, fontSize:11, bold:true, color:C.white, valign:"middle"
    });
    s.addText(st.detail, {
      x:SX+2.55, y:sy+0.06, w:6.95, h:0.46, margin:0,
      fontFace:i===5 ? "Consolas" : FONT, fontSize:10, color:"D0E8FF", valign:"middle"
    });
    if (i < steps.length-1) {
      s.addShape("rect", { x:4.7, y:sy+SH, w:0.3, h:0.06, fill:{color:C.teal}, line:{color:C.teal} });
    }
    sy += SH + 0.06;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Authentication Flows
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  hdr(s, "Authentication Flows");

  const auths = [
    { name:"oauth",       tag:"Recommended", desc:"Full browser-based OAuth 2.0 with PKCE. Most secure.",          bg:C.blue,  rec:true  },
    { name:"oauthclient", tag:"",            desc:"OAuth where the client app manages token exchange.",             bg:"2E6DA4", rec:false },
    { name:"bearer",      tag:"CI/CD",       desc:"Pass a valid SAS Viya access token directly.",                   bg:"3A5070", rec:false },
    { name:"token",       tag:"",            desc:"Load access token from a local file path.",                      bg:"5A6A7A", rec:false },
    { name:"sascli",      tag:"",            desc:"Use authentication from an existing sas-viya-cli profile.",      bg:"6B7A8D", rec:false },
    { name:"password",    tag:"Avoid",       desc:"Direct credential auth. Use OAuth-based flows for security.",    bg:"8A3030", rec:false },
  ];

  const CW = 4.55, CH = 1.05;
  const positions = [
    [0.35, 0.68], [4.98, 0.68],
    [0.35, 1.85], [4.98, 1.85],
    [0.35, 3.02], [4.98, 3.02],
  ];

  for (let i=0; i<auths.length; i++) {
    const a = auths[i];
    const [ax, ay] = positions[i];
    s.addShape("rect", { x:ax, y:ay, w:CW, h:CH,
      fill:{color:a.bg}, line:{color:a.bg}, shadow:makeShadow() });
    // Name badge
    s.addShape("rect", { x:ax+0.12, y:ay+0.14, w:1.3, h:0.3,
      fill:{color:"FFFFFF", transparency:80}, line:{color:C.white, pt:1, transparency:60} });
    s.addText(a.name, {
      x:ax+0.12, y:ay+0.14, w:1.3, h:0.3, margin:0,
      fontFace:"Consolas", fontSize:11, bold:true, color:C.white, align:"center", valign:"middle"
    });
    if (a.tag) {
      s.addShape("rect", { x:ax+1.55, y:ay+0.17, w:0.9, h:0.24,
        fill:{color:C.teal}, line:{color:C.teal} });
      s.addText(a.tag, {
        x:ax+1.55, y:ay+0.17, w:0.9, h:0.24, margin:0,
        fontFace:FONT, fontSize:8.5, bold:true, color:C.white, align:"center", valign:"middle"
      });
    }
    s.addText(a.desc, {
      x:ax+0.12, y:ay+0.52, w:CW-0.22, h:0.45,
      fontFace:FONT, fontSize:10, color:"D0E8FF", valign:"top"
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Deployment Options
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Title
  s.addShape("rect", { x:0, y:0, w:10, h:0.55, fill:{color:"0D1F35"}, line:{color:"0D1F35"} });
  s.addText("Deployment Options", {
    x:0.35, y:0, w:9.3, h:0.55, margin:0,
    fontFace:FONT, fontSize:20, bold:true, color:C.white, valign:"middle"
  });

  const opts = [
    {
      title:"Local CLI",
      cmd:"npx @sassoftware/sas-score-mcp-serverjs",
      transport:"Stdio Transport",
      points:["No global install needed","Claude Desktop & VS Code","Single-user development","Ideal for local testing"],
      accent:C.teal
    },
    {
      title:"Docker Container",
      cmd:"ghcr.io/sassoftware/\nsas-score-mcp-serverjs:latest",
      transport:"HTTP Transport",
      points:["Pull from GitHub Container Registry","HTTP server on port 8080","Multi-user concurrent support","Deploy anywhere Docker runs"],
      accent:C.blue
    },
    {
      title:"Cloud  (Azure / AWS)",
      cmd:"Container App · ECS · Kubernetes",
      transport:"HTTP + OAuth",
      points:["Managed container service","Enterprise OAuth PKCE","Scalable multi-user architecture","Production SAS Viya integration"],
      accent:"8B5CF6"
    },
  ];

  const CW = 2.95, CH = 4.35, CY = 0.72;
  const cxs = [0.35, 3.48, 6.61];
  for (let i=0; i<opts.length; i++) {
    const o = opts[i];
    const cx = cxs[i];
    s.addShape("rect", { x:cx, y:CY, w:CW, h:CH,
      fill:{color:"FFFFFF", transparency:6}, line:{color:"FFFFFF", pt:1, transparency:75},
      shadow:makeShadow() });
    // Accent bar
    s.addShape("rect", { x:cx, y:CY, w:CW, h:0.32, fill:{color:o.accent}, line:{color:o.accent} });
    s.addText(o.title, {
      x:cx+0.12, y:CY, w:CW-0.15, h:0.32, margin:0,
      fontFace:FONT, fontSize:13, bold:true, color:C.white, valign:"middle"
    });
    // Transport badge
    s.addShape("rect", { x:cx+0.12, y:CY+0.4, w:CW-0.25, h:0.28,
      fill:{color:o.accent, transparency:70}, line:{color:o.accent, pt:1, transparency:40} });
    s.addText(o.transport, {
      x:cx+0.12, y:CY+0.4, w:CW-0.25, h:0.28, margin:0,
      fontFace:FONT, fontSize:10, bold:true, color:C.white, align:"center", valign:"middle"
    });
    // Command
    s.addText(o.cmd, {
      x:cx+0.12, y:CY+0.76, w:CW-0.22, h:0.56,
      fontFace:"Consolas", fontSize:9, color:o.accent === C.teal ? "80FFE8" : "CADCFC"
    });
    // Points
    const rows = o.points.map((p,j) => ({
      text:p, options:{ bullet:true, breakLine: j < o.points.length-1 }
    }));
    s.addText(rows, {
      x:cx+0.12, y:CY+1.42, w:CW-0.22, h:2.65,
      fontFace:FONT, fontSize:10.5, color:"D0E8FF", paraSpaceAfter:6
    });
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────
pres.writeFile({ fileName:"sas-score-mcp-workflow.pptx" }).then(() => {
  console.log("✓  sas-score-mcp-workflow.pptx written");
});
