/*
 * example.js — Demonstrates all three usage patterns.
 *
 * Run:  node src/example.js
 *
 * Set environment variables before running:
 *   SAS_ACCESS_TOKEN   — SAS Viya bearer token
 *   ANTHROPIC_API_KEY  — Anthropic API key  (or use ChatOpenAI + OPENAI_API_KEY)
 *   MCP_URL            — (optional) override MCP server URL
 */

import { SasScoreAgent } from './SasScoreAgent.js';
import { listSkillNames } from './loadSkills.js';

// ─── 1. Choose your LLM ───────────────────────────────────────────────────────
// Swap in ChatOpenAI, ChatVertexAI, etc. — any LangChain ChatModel works.
import { ChatAnthropic } from '@langchain/anthropic';

const llm = new ChatAnthropic({
  model: 'claude-opus-4-5',
  maxTokens: 4096,
});

// ─── 2. Auth — the token is passed through to the MCP server on every call ───
const accessToken = process.env.SAS_ACCESS_TOKEN;
if (!accessToken) {
  console.error('ERROR: SAS_ACCESS_TOKEN environment variable is required.');
  process.exit(1);
}

// ─── 3. Show loaded skills ────────────────────────────────────────────────────
console.log('Available skills:', listSkillNames());

// ─── 4. Pattern A: Simple invoke ──────────────────────────────────────────────
async function exampleSimpleInvoke() {
  console.log('\n--- Pattern A: Simple invoke ---');

  const agent = await SasScoreAgent.create(llm, {
    auth: { accessToken },
    mcpUrl: process.env.MCP_URL,   // defaults to Azure endpoint if unset
    verboseSkills: true,
  });

  try {
    const { output } = await agent.invoke(
      'Score a customer with age=45, income=60000 using the churnRisk model'
    );
    console.log('Result:', output);
  } finally {
    await agent.close();   // always release — avoids connection leaks
  }
}

// ─── 5. Pattern B: Streaming (show intermediate tool calls) ──────────────────
async function exampleStreaming() {
  console.log('\n--- Pattern B: Streaming ---');

  const agent = await SasScoreAgent.create(llm, {
    auth: { accessToken },
  });

  try {
    for await (const chunk of agent.stream('List the first 5 MAS models')) {
      if (chunk.agent) {
        const msg = chunk.agent.messages?.at(-1);
        if (msg?.content) console.log('[agent]', msg.content);
      } else if (chunk.tools) {
        const msg = chunk.tools.messages?.at(-1);
        if (msg?.content) console.log('[tool] ', msg.content?.slice(0, 120));
      }
    }
  } finally {
    await agent.close();
  }
}

// ─── 6. Pattern C: Per-request factory (multi-user server) ───────────────────
//
// In an Express/Fastify handler, call SasScoreAgent.create() on every
// request so each user's token is isolated in its own MCP client.
//
//   app.post('/chat', async (req, res) => {
//     const token = req.headers.authorization?.slice(7);
//     const agent = await SasScoreAgent.create(llm, {
//       auth: { accessToken: token },
//     });
//     try {
//       const { output } = await agent.invoke(req.body.message);
//       res.json({ output });
//     } finally {
//       await agent.close();
//     }
//   });

// ─── Run examples ─────────────────────────────────────────────────────────────
await exampleSimpleInvoke();
await exampleStreaming();
