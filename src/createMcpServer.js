/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds the MCP server factory used by both the stateless HTTP entry
 * (createMcpHandler) and the stdio entry (serveStdio). The same factory is
 * called once per request (HTTP) or once per connection (stdio) to build a
 * fresh McpServer bound to a fresh, request-scoped appContext — there is no
 * shared session state between calls.
 */
import { McpServer } from "@modelcontextprotocol/server";
import makeTools from "./toolSet/makeTools.js";
import getLogonPayload from "./toolHelpers/getLogonPayload.js";

function makeServerFactory(appEnvBase) {
  return async function serverFactory(ctx) {
    // clone the base template; this becomes the per-request appContext
    const _appContext = Object.assign({}, appEnvBase, { contexts: Object.assign({}, appEnvBase.contexts) });

    // HTTP only — ctx.requestInfo/ctx.authInfo are unset over stdio, so the
    // CLI-managed auth flows (sascli/token/refresh/password/none) fall
    // through untouched.
    if (ctx.requestInfo) {
      const req = ctx.requestInfo;
      const viyaServerHeader = req.headers.get("x-viya-server");
      if (viyaServerHeader) {
        console.error("[Note] Using user supplied VIYA server");
        _appContext.VIYA_SERVER = viyaServerHeader;
      }
      const refreshHeader = req.headers.get("x-refresh-token");
      if (refreshHeader) {
        console.error("[Note] Using user supplied refresh token for authorization");
        _appContext.REFRESH_TOKEN = refreshHeader;
        _appContext.AUTHFLOW = "refresh";
      }
    }
    if (ctx.authInfo) {
      // already verified by requireBearerAuth before this factory runs
      _appContext.bearerToken = ctx.authInfo.token;
    }

    console.error("[Note] Getting logon payload for new request, AUTHFLOW:", _appContext.AUTHFLOW);
    _appContext.contexts.logonPayload = await getLogonPayload(_appContext);

    const mcpServer = new McpServer(
      {
        name: "sasmcp",
        version: _appContext.version,
      },
      {
        capabilities: {
          tools: {
            listChanged: true,
          },
        },
      }
    );

    const toolSet = makeTools(_appContext);
    let toolNames = [];
    let totalDescription = 0;
    toolSet.forEach((tool) => {
      const toolName = _appContext.brand + "-" + tool.name;
      const config = {
        description: tool.description,
        inputSchema: tool.inputSchema,
      };
      totalDescription += tool.description.length;
      mcpServer.registerTool(toolName, config, (args) => {
        const params = args == null
          ? { _appContext: _appContext.contexts }
          : Object.assign({}, args, { _appContext: _appContext.contexts });
        return tool.handler(params);
      });
      toolNames.push(toolName);
    });
    console.error(`[Note] Registered ${toolSet.length} tools: ${toolNames}`);
    console.error(`[Note] Total description length: ${totalDescription} characters`);
    return mcpServer;
  };
}

export default makeServerFactory;
