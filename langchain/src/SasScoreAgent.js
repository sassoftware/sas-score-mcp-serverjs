/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * SasScoreAgent.js
 * ----------------
 * High-level agent wrapper around the SAS Score MCP server.
 *
 * Architecture
 * ------------
 *
 *   User request
 *       │
 *       ▼
 *   SasScoreAgent.invoke(input)
 *       │
 *       ├─ System prompt built from all SKILL.md files (skills as decision trees)
 *       │
 *       ├─ LangGraph ReAct agent
 *       │       │
 *       │       └─ MCP tools  ──►  SAS Score MCP Server  ──►  SAS Viya
 *       │
 *       └─ Returns { output, messages }
 *
 * Authorization passthrough
 * -------------------------
 * The auth token supplied at construction time is injected into every HTTP
 * request made to the MCP server via the `Authorization: Bearer` header.
 * Because headers are set at client construction, create a NEW SasScoreAgent
 * instance per user/session (call SasScoreAgent.create() in your request
 * handler).  Reuse the same instance only within a single authenticated session.
 *
 * Usage
 * -----
 *   import { SasScoreAgent } from '@sassoftware/sas-score-langchain';
 *   import { ChatAnthropic } from '@langchain/anthropic';
 *
 *   const llm = new ChatAnthropic({ model: 'claude-opus-4-5' });
 *
 *   // One agent per user session:
 *   const agent = await SasScoreAgent.create(llm, {
 *     auth: { accessToken: req.headers.authorization.slice(7) },
 *   });
 *
 *   try {
 *     const result = await agent.invoke('Score customer age=45, income=60000 with churnRisk model');
 *     console.log(result.output);
 *   } finally {
 *     await agent.close();   // always release the MCP connection
 *   }
 */

import { createReactAgent }  from '@langchain/langgraph/prebuilt';
import { HumanMessage }      from '@langchain/core/messages';
import { createMcpTools }    from './createMcpTools.js';
import { loadSkills }        from './loadSkills.js';

export class SasScoreAgent {
  /**
   * @param {object} llm            - Any LangChain ChatModel
   * @param {object} reactAgent     - Compiled LangGraph ReAct agent
   * @param {object} mcpClient      - The underlying MultiServerMCPClient (for cleanup)
   * @param {string[]} toolNames    - Names of registered MCP tools
   */
  constructor(llm, reactAgent, mcpClient, toolNames) {
    this._llm       = llm;
    this._agent     = reactAgent;
    this._client    = mcpClient;
    this.toolNames  = toolNames;
  }

  /**
   * Factory — creates and initialises a SasScoreAgent.
   *
   * @param {object} llm           - LangChain ChatModel (ChatAnthropic, ChatOpenAI, …)
   * @param {object} [opts]
   * @param {object} [opts.auth]          - Auth credentials
   * @param {string} [opts.auth.accessToken]  - SAS Viya / MCP access token
   * @param {string} [opts.auth.refreshToken] - SAS Viya refresh token
   * @param {string} [opts.auth.viyaServer]   - Override SAS Viya server URL
   * @param {string} [opts.mcpUrl]        - Override MCP server URL
   * @param {object} [opts.extraHeaders]  - Extra HTTP headers for every MCP call
   * @param {boolean}[opts.verboseSkills] - Log skill names to stderr on load
   * @param {number} [opts.recursionLimit=50] - LangGraph recursion limit
   * @returns {Promise<SasScoreAgent>}
   */
  static async create(llm, opts = {}) {
    const {
      auth           = {},
      mcpUrl,
      extraHeaders   = {},
      verboseSkills  = false,
      recursionLimit = 50,
    } = opts;

    // 1. Connect to MCP server and get tools
    const { client, tools } = await createMcpTools({ auth, mcpUrl, extraHeaders });

    // 2. Load all SKILL.md decision trees into a system prompt
    const skillPrompt = loadSkills({ verbose: verboseSkills });

    // 3. Build a ReAct agent with the skills as the system message
    const agent = createReactAgent({
      llm,
      tools,
      stateModifier: skillPrompt,
      // Prevent infinite tool-call loops on complex requests
      checkpointSaver: undefined,
    });

    const toolNames = tools.map(t => t.name);
    return new SasScoreAgent(llm, agent, client, toolNames);
  }

  /**
   * Invoke the agent with a user message.
   *
   * @param {string|object} input  - Plain string or LangChain message
   * @param {object} [runOpts]     - Optional LangGraph run config (callbacks, etc.)
   * @returns {Promise<{ output: string, messages: BaseMessage[] }>}
   */
  async invoke(input, runOpts = {}) {
    const messages = typeof input === 'string'
      ? [new HumanMessage(input)]
      : [input];

    const result = await this._agent.invoke(
      { messages },
      { recursionLimit: 50, ...runOpts }
    );

    // Last AI message is the final answer
    const lastMsg = result.messages.at(-1);
    const output  = typeof lastMsg?.content === 'string'
      ? lastMsg.content
      : JSON.stringify(lastMsg?.content ?? '');

    return { output, messages: result.messages };
  }

  /**
   * Stream agent execution step-by-step.
   * Yields objects with { type: 'step'|'output', ... }
   *
   * @param {string} input
   * @param {object} [runOpts]
   * @returns {AsyncGenerator}
   */
  async *stream(input, runOpts = {}) {
    const messages = [new HumanMessage(input)];
    const stream   = await this._agent.stream(
      { messages },
      { recursionLimit: 50, streamMode: 'updates', ...runOpts }
    );
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Release MCP connections.  Always call this when the agent session ends.
   */
  async close() {
    await this._client.close();
  }
}
