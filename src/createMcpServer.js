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
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE, getUiCapability } from "@modelcontextprotocol/ext-apps/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import makeTools from "./toolSet/makeTools.js";
import getLogonPayload from "./toolHelpers/getLogonPayload.js";

// MCP App: every tool whose spec sets `ui: true` is linked to this one html view (built from ./ui by
// `npm run build:ui`). Those tools still return their normal `content` text, so hosts without
// MCP Apps support see no difference.
const UI_RESOURCE_URI = "ui://sasmcp/view.html";
const UI_HTML_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "ui", "index.html");
let uiHtmlPromise;
const loadUiHtml = () => (uiHtmlPromise ??= readFile(UI_HTML_FILE, "utf-8"));

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

    mcpServer.server.oninitialized = () => {
      const client = mcpServer.getClientVersion();
      const ui = getUiCapability(mcpServer.getClientCapabilities());
      console.error("[Note] Client:", JSON.stringify(client), "MCP Apps:", ui ? JSON.stringify(ui) : "no");
    };

    registerAppResource(
      mcpServer,
      "Viya Table Views",
      UI_RESOURCE_URI,
      { mimeType: RESOURCE_MIME_TYPE, description: "Interactive table view for SAS results" },
      async () => {
        console.error("[Note]>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> resources/read", UI_RESOURCE_URI);
        const html = await loadUiHtml();
        return { contents: [{ uri: UI_RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html }] };
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
      const callback = (args) => {
        const params = args == null
          ? { _appContext: _appContext.contexts }
          : Object.assign({}, args, { _appContext: _appContext.contexts });
        return tool.handler(params);
      };
      if (tool.ui) {
        console.error(`[Note] Registering UI tool with resource URI: ${UI_RESOURCE_URI}: ${toolName}`);
        registerAppTool(mcpServer, toolName, { ...config, _meta: { ui: { resourceUri: UI_RESOURCE_URI } } }, callback);
      } else {
        mcpServer.registerTool(toolName, config, callback);
      }
      toolNames.push(toolName);
    });
    //console.error(`[Note] Registered ${toolSet.length} tools: ${toolNames}`);
    console.error(`[Note] Total description length: ${totalDescription} characters`);
    return mcpServer;
  };
}

export default makeServerFactory;
