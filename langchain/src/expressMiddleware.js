/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * expressMiddleware.js
 * --------------------
 * Drop-in Express middleware that exposes a /chat endpoint.
 * Creates a fresh SasScoreAgent per request so each user's
 * Authorization token is isolated in its own MCP client.
 *
 * Usage:
 *   import express from 'express';
 *   import { chatRouter } from '@sassoftware/sas-score-langchain/expressMiddleware';
 *   import { ChatAnthropic } from '@langchain/anthropic';
 *
 *   const app = express();
 *   app.use(express.json());
 *   app.use('/sas', chatRouter(new ChatAnthropic({ model: 'claude-opus-4-5' })));
 *   app.listen(3000);
 *
 *   POST /sas/chat
 *   Headers: Authorization: Bearer <sas-viya-token>
 *   Body:    { "message": "Score customer age=45 with churnRisk" }
 */

import express          from 'express';
import { SasScoreAgent } from './SasScoreAgent.js';

/**
 * Build an Express Router with:
 *   POST /chat  — single-turn invoke
 *   POST /chat/stream — streaming via Server-Sent Events
 *
 * @param {object} llm      - LangChain ChatModel shared across all requests
 * @param {object} [opts]
 * @param {string} [opts.mcpUrl]  - Override MCP server URL
 * @returns {express.Router}
 */
export function chatRouter(llm, opts = {}) {
  const router = express.Router();

  // ── POST /chat ─────────────────────────────────────────────────────────────
  router.post('/chat', async (req, res) => {
    const { message, viyaServer, refreshToken } = req.body ?? {};

    if (!message) {
      return res.status(400).json({ error: 'message is required in request body' });
    }

    // Extract token from Authorization header — passed straight through to MCP
    const authHeader = req.headers['authorization'] ?? '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    // Build auth object — only include fields that were actually provided
    const auth = {};
    if (accessToken)  auth.accessToken  = accessToken;
    if (refreshToken) auth.refreshToken = refreshToken;
    if (viyaServer)   auth.viyaServer   = viyaServer;

    let agent;
    try {
      agent = await SasScoreAgent.create(llm, { auth, mcpUrl: opts.mcpUrl });
      const { output, messages } = await agent.invoke(message);
      res.json({ output, stepCount: messages.length });
    } catch (err) {
      console.error('[chat] error:', err.message);
      res.status(500).json({ error: err.message });
    } finally {
      await agent?.close();
    }
  });

  // ── POST /chat/stream  ─────────────────────────────────────────────────────
  // Returns Server-Sent Events so the caller sees each agent step as it happens.
  router.post('/chat/stream', async (req, res) => {
    const { message, viyaServer, refreshToken } = req.body ?? {};

    if (!message) {
      return res.status(400).json({ error: 'message is required in request body' });
    }

    const authHeader  = req.headers['authorization'] ?? '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const auth = {};
    if (accessToken)  auth.accessToken  = accessToken;
    if (refreshToken) auth.refreshToken = refreshToken;
    if (viyaServer)   auth.viyaServer   = viyaServer;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (type, data) =>
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);

    let agent;
    try {
      agent = await SasScoreAgent.create(llm, { auth, mcpUrl: opts.mcpUrl });

      for await (const chunk of agent.stream(message)) {
        if (chunk.agent) {
          const msg = chunk.agent.messages?.at(-1);
          if (msg?.content) send('agent', { content: msg.content });
        } else if (chunk.tools) {
          const msg = chunk.tools.messages?.at(-1);
          if (msg?.content) send('tool', { content: msg.content });
        }
      }
      send('done', {});
    } catch (err) {
      send('error', { message: err.message });
    } finally {
      await agent?.close();
      res.end();
    }
  });

  return router;
}
