# @sassoftware/sas-score-langchain

LangChain agent client for the **SAS Score MCP Server**.  
Connects to a remote MCP endpoint, loads all scoring skills as the system prompt, and exposes a simple `invoke` / `stream` API.

---

## Architecture

```
User request
    │
    ▼
SasScoreAgent.invoke(message)
    │
    ├─ System prompt = all 13 SKILL.md decision trees
    │
    ├─ LangGraph ReAct agent
    │       │
    │       └─ MCP tools (Authorization header passed through on every call)
    │               │
    │               └─ SAS Score MCP Server (Azure)
    │                       │
    │                       └─ SAS Viya
    └─ Returns { output, messages }
```

---

## Authorization Passthrough

The `Authorization: Bearer <token>` header is injected into **every HTTP request** to the MCP server by `@langchain/mcp-adapters`.  The token travels:

```
Client code  →  MultiServerMCPClient  →  MCP Server  →  SAS Viya
              (headers set at init)      (reads token,   (uses token)
                                          validates)
```

**Important**: headers are bound at client construction time.  For multi-user servers, create a **new `SasScoreAgent` per request** (see Pattern C below).

Additional headers supported by the server:

| Header | Purpose |
|---|---|
| `Authorization: Bearer <token>` | SAS Viya access token |
| `X-REFRESH-TOKEN: <token>` | SAS Viya refresh token (alternative to access token) |
| `X-VIYA-SERVER: <url>` | Override the target SAS Viya server |

---

## Installation

```bash
npm install @sassoftware/sas-score-langchain @langchain/anthropic
# or
npm install @sassoftware/sas-score-langchain @langchain/openai
```

---

## Quick Start

```js
import { SasScoreAgent } from '@sassoftware/sas-score-langchain';
import { ChatAnthropic }  from '@langchain/anthropic';

const llm   = new ChatAnthropic({ model: 'claude-opus-4-5' });
const agent = await SasScoreAgent.create(llm, {
  auth: { accessToken: process.env.SAS_ACCESS_TOKEN },
});

const { output } = await agent.invoke(
  'Score customer age=45, income=60000 with the churnRisk MAS model'
);
console.log(output);
await agent.close();
```

---

## API

### `SasScoreAgent.create(llm, opts)`

| Option | Type | Default | Description |
|---|---|---|---|
| `auth.accessToken` | `string` | — | SAS Viya / MCP bearer token |
| `auth.refreshToken` | `string` | — | SAS Viya refresh token |
| `auth.viyaServer` | `string` | — | Override Viya server URL |
| `mcpUrl` | `string` | `https://sas-score-latest.azurewebsites.net/mcp` | MCP server endpoint |
| `extraHeaders` | `object` | `{}` | Any additional HTTP headers |
| `verboseSkills` | `boolean` | `false` | Log skill names on load |
| `recursionLimit` | `number` | `50` | LangGraph max steps |

### `agent.invoke(message, runOpts?)`

Returns `{ output: string, messages: BaseMessage[] }`.

### `agent.stream(message, runOpts?)`

Async generator — yields LangGraph update chunks as the agent works through steps.

### `agent.close()`

Releases the underlying MCP connection.  **Always call this**, ideally in a `finally` block.

---

## Usage Patterns

### Pattern A — Single-user CLI / script

```js
const agent = await SasScoreAgent.create(llm, { auth: { accessToken } });
try {
  const { output } = await agent.invoke('List the top 10 MAS models');
  console.log(output);
} finally {
  await agent.close();
}
```

### Pattern B — Streaming

```js
for await (const chunk of agent.stream('Describe the churnRisk model')) {
  if (chunk.agent?.messages?.at(-1)?.content)
    process.stdout.write(chunk.agent.messages.at(-1).content);
}
```

### Pattern C — Multi-user Express server

```js
import express            from 'express';
import { chatRouter }     from '@sassoftware/sas-score-langchain/expressMiddleware';
import { ChatAnthropic }  from '@langchain/anthropic';

const app = express();
app.use(express.json());

// The LLM is shared; a fresh MCP client is created per request.
app.use('/sas', chatRouter(new ChatAnthropic({ model: 'claude-opus-4-5' })));

app.listen(3000);
```

```
POST /sas/chat
Authorization: Bearer <sas-viya-token>
Content-Type: application/json

{ "message": "Score customer age=45, income=60000 with churnRisk" }
```

```
POST /sas/chat/stream        ← Server-Sent Events
```

---

## Skills

All 13 SKILL.md decision trees are embedded in the agent's system prompt:

| Group | Skills |
|---|---|
| Routing & Entry | `request-routing`, `score-strategy` |
| Scoring Specialists | `score-mas-scr`, `score-job-jobdef`, `score-program`, `score-cas` |
| Data Access | `read-strategy`, `find-resources`, `find-library-server` |
| Discovery & Detail | `list-library`, `list-tables`, `list-mas-job-jobdef`, `detail-strategy` |

The skills are loaded from `.skills/skills/` (repo usage) or from a bundled `skills/` copy (npm package).

```js
import { listSkillNames } from '@sassoftware/sas-score-langchain';
console.log(listSkillNames());
// ['request-routing', 'score-strategy', ...]
```
