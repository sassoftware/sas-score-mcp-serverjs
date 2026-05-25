# SAS Viya Unified Strategy - Quick Reference

This folder contains simplified, consolidated strategies for working with SAS Viya through the MCP server.

> **Claude Code Plugin**: The parent `.skills/` directory is a Claude Code plugin. See [Plugin Usage](#plugin-usage) at the bottom of this file for installation instructions.

## Files

### Core Strategies

1. **request-routing** — Universal three-step workflow
   - Step 1: Verify resources exist
   - Step 2: Execute the request
   - Step 3: Merge results

2. **find-resources** — Resource verification strategy
   - How to find/verify libraries, tables, models, jobs, jobdefs
   - Server determination logic
   - Default libraries reference

3. **list-resource** — Resource listing strategy
   - How to list/browse libraries, tables, models, jobs, jobdefs
   - Pagination parameters and strategy
   - Server determination for tables
   - Differences between find (verify) vs list (discover)

4. **read-strategy** — Data reading strategy
   - Raw row reads (sas-score-read-table)
   - Analytical queries (sas-score-sas-query)
   - Decision tree for choosing the right tool

5. **score-strategy** — Scoring workflow
   - MAS, Job, JobDef, SCR scoring
   - Inline scenarios vs table rows
   - Result formatting and merging

### Agent

6. **sas-score-mcp-serverjs-agent** — Main agent instructions
   - Orchestration logic
   - Decision trees
   - Implementation checklist

---

## Key Principles

### 1. Three-Step Workflow (Always)

Every request follows the same pattern:
```
Verify → Execute → Format
```

### 2. No Ambiguity

- Clear classification of request type
- Explicit server determination for tables (CAS vs SAS)
- Explicit model type determination (MAS vs Job vs JobDef vs SCR)

### 3. Verification Before Execution

Always verify resources exist before executing (except SCR which has no pre-check).

### 4. Simplified Tool Mapping

| Resource | Tool |
|---|---|
| Find library | sas-score-find-library |
| Find table | sas-score-find-table |
| Find model (MAS) | sas-score-find-mas |
| Find job | sas-score-find-job |
| Find jobdef | sas-score-find-jobdef |
| Read table | sas-score-read-table |
| Query table | sas-score-sas-query |
| Score (MAS) | sas-score-mas-score |
| Score (Job/JobDef) | sas-score-score-jobdef |
| Score (SCR) | sas-score-scr-score |

---

## Using These Strategies

1. **Start with request-routing** to understand the three-step workflow
2. **Use find-resources** when verifying resources
3. **Use read-strategy** when reading data
4. **Use score-strategy** when scoring/predicting
5. **Reference agent sas-score-mcp-serverjs-agent.md** for orchestration

---

## Why Simplified?

The original `.skills` folder had multiple overlapping strategies that caused confusion:
- Multiple ways to find the same resource
- Unclear when to use read vs query
- Ambiguous model type inference
- Complex decision trees

This simplified system:
- **One way to find each resource** (not multiple smart strategies)
- **Clear read vs query decision** (raw rows vs aggregations)
- **Explicit model type handling** (default MAS, allow .job/.jobdef/.scr suffixes)
- **Consistent three-step workflow** (verify → execute → format)

---

## Migration Path

If you were using the old `.skills` folder:

| Old Skill | New Location |
|---|---|
| sas-find-resources-strategy | FIND-RESOURCE.md |
| sas-list-resource-strategy | REQUEST-ROUTING.md + list-* tools |
| sas-find-library-smart | FIND-RESOURCE.md (library section) |
| sas-list-tables-smart | READ-STRATEGY.md + list-tables tool |
| sas-read-strategy | READ-STRATEGY.md |
| sas-read-and-score-strategy | SCORE-STRATEGY.md (Option B) |
| sas-score-workflow-strategy | SCORE-STRATEGY.md |
| sas-request-classifier | REQUEST-ROUTING.md (classification section) |

---

## Questions?

Each strategy file has detailed examples, decision trees, and error handling guidance. Start with the strategy that matches your request type.

---

## Plugin Usage

The `.skills/` directory (one level up from here) is a Claude Code plugin. It bundles these skills, the agent instructions, and the MCP server configuration.

### Plugin structure

```
.skills/
├── .claude-plugin/plugin.json   ← plugin manifest
├── .mcp.json                    ← MCP server config (stdio, npx)
├── agents/
│   └── sas-score-mcp-serverjs-agent.md
└── skills/
    ├── request-routing/SKILL.md
    ├── find-resources/SKILL.md
    ├── list-resource/SKILL.md
    ├── read-strategy/SKILL.md
    ├── score-strategy/SKILL.md
    └── detail-strategy/SKILL.md
```

### Install (after npm install)

```bash
# Point Claude Code at the plugin directory inside the installed package
/plugin install ./node_modules/@sassoftware/sas-score-mcp-serverjs/.skills

# Or from the git repo directly
/plugin install https://github.com/sassoftware/sas-score-mcp-serverjs --subdir .skills
```

### Required environment variables

| Variable | Default | Description |
|---|---|---|
| `VIYA_SERVER` | *(required)* | SAS Viya server URL, e.g. `https://my-viya.example.com` |
| `AUTHFLOW` | `oauth` | Auth flow: `oauth`, `code`, `sascli`, `token`, `bearer` |
| `CLIENTID` | `vscodemcp` | OAuth client ID registered on the Viya server |
| `CASSERVER` | `cas-shared-default` | CAS server name |
| `COMPUTECONTEXT` | `SAS Job Execution compute context` | Compute context name |

Set these in your shell or a `.env` file before starting Claude Code.

### HTTP transport (remote/production deployments)

The default `.mcp.json` uses stdio (local npx). For a remotely deployed server (e.g. Docker on Azure), replace the entry in `.mcp.json` with:

```json
{
  "mcpServers": {
    "sas-score-mcp-serverjs": {
      "type": "http",
      "url": "https://<your-deployed-host>/mcp"
    }
  }
}
```
