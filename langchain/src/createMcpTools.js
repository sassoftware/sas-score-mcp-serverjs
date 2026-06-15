/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * createMcpTools.js
 * -----------------
 * Factory that creates a MultiServerMCPClient wired to the SAS Score MCP server
 * and returns its tools.
 *
 * AUTHORIZATION PASSTHROUGH
 * -------------------------
 * @langchain/mcp-adapters supports a `headers` map per server config.  Those
 * headers are injected into every HTTP request the client makes to the MCP
 * endpoint.  This means the user's `Authorization: Bearer <token>` travels
 * through LangChain → MCP client → MCP server unchanged.
 *
 * Per-user auth:  headers are set at client construction time, so for a
 * multi-user server you must create a NEW client per user/request (this
 * factory makes that cheap).  Do NOT share a single client across users.
 *
 * The server also supports:
 *   X-VIYA-SERVER   — override the target SAS Viya host
 *   X-REFRESH-TOKEN — pass a refresh token instead of an access token
 */

import { MultiServerMCPClient } from '@langchain/mcp-adapters';

const DEFAULT_MCP_URL = 'https://sas-score-latest.azurewebsites.net/mcp';

/**
 * Build the HTTP headers that will be sent on every MCP call.
 *
 * @param {object} auth
 * @param {string}  [auth.accessToken]   - SAS Viya access token  (Authorization: Bearer …)
 * @param {string}  [auth.refreshToken]  - SAS Viya refresh token (X-REFRESH-TOKEN)
 * @param {string}  [auth.viyaServer]    - override Viya server   (X-VIYA-SERVER)
 * @returns {Record<string,string>}
 */
function buildHeaders(auth = {}) {
  const headers = {};
  if (auth.accessToken)  headers['Authorization']   = `Bearer ${auth.accessToken}`;
  if (auth.refreshToken) headers['X-REFRESH-TOKEN'] = auth.refreshToken;
  if (auth.viyaServer)   headers['X-VIYA-SERVER']   = auth.viyaServer;
  return headers;
}

/**
 * Create a MultiServerMCPClient connected to the SAS Score MCP server and
 * return the resolved LangChain tools array.
 *
 * The caller is responsible for calling `client.close()` when finished.
 * Both the client (for cleanup) and the tools array are returned.
 *
 * @param {object} [opts]
 * @param {object} [opts.auth]           - auth credentials (see buildHeaders)
 * @param {string} [opts.mcpUrl]         - override MCP server URL
 * @param {object} [opts.extraHeaders]   - any additional headers to merge in
 * @returns {Promise<{ client: MultiServerMCPClient, tools: StructuredTool[] }>}
 */
export async function createMcpTools(opts = {}) {
  const {
    auth = {},
    mcpUrl = DEFAULT_MCP_URL,
    extraHeaders = {},
  } = opts;

  const headers = { ...buildHeaders(auth), ...extraHeaders };

  const client = new MultiServerMCPClient({
    mcpServers: {
      'sas-score': {
        transport: 'http',
        url: mcpUrl,
        headers,
        // useNodeEventSource: true if the server uses SSE streaming
      },
    },
  });

  const tools = await client.getTools();

  if (tools.length === 0) {
    await client.close();
    throw new Error(
      `No tools returned from MCP server at ${mcpUrl}. ` +
      'Check the URL, auth token, and server availability.'
    );
  }

  return { client, tools };
}
