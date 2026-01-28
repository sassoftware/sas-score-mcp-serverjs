/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import appServer from "@sassoftware/viya-serverjs";
import handleRequest from "./handleRequest.js";
import handleGetDelete from "./handleGetDelete.js";
import urlOpen from "./urlOpen.js";
//import { auth } from "@modelcontextprotocol/sdk/client/auth.js";

async function hapiMcpServer(mcpServer, cache, baseAppEnvContext) {

  console.error(appServer);
  appServer(mcpHandlers, true, 'app', null);
  if (process.env.AUTOSTART === 'TRUE') {
    await urlOpen();
  }

  function mcpHandlers() {
    let routes = [
      {
        method: ["GET"],
        path: "/health",
        options: {
          handler: async (req, h) => {
            let health = {
              name: "@sassoftware/mcp-server",
              version: baseAppEnvContext.version,
              description: "SAS Viya Sample MCP Server",
              endpoints: {
                mcp: "/mcp",
                health: "/health",
              },
              usage:
                "Use with MCP Inspector or compatible MCP clients like vscode or your own MCP client",
            };
            console.error("Health check requested, returning:", health);
            return h.response(health).code(200).type('application/json');
          },
          auth: false,
          description: "Help",
          notes: "Help",
          tags: ["app"],
        }
      },
      {
        method: ["POST"],
        path: `/mcp`,
        options: {
          handler: async (req, h) => {
            let precontext = req.pre.context;
            let oauthInfo = (precontext != null) ? precontext.credentials : null;
            await handleRequest(mcpServer, cache, req, h, oauthInfo);
            return h.abandon;
          },

          auth: {
            strategy: "session",
            mode: 'try'
          },
          description: "The main route for MCP requests",
          notes: "Requires a valid session",
          tags: ["mcp"],
        },
      },
      {
        method: ["GET", "DELETE"],
        path: `/mcp`,

        options: {
          handler: async (req, h) => {
            await handleGetDelete(mcpServer, cache, req, h);
            return h.abandon;
          },
          auth: {
            strategy: "session",
            mode: 'try'
          },
          description: "Handle GET and DELETE requests",
          notes: "Will fail if no valid session",
          tags: ["mcp"],
        },
      }

    ];
    return routes;
  }
}
export default hapiMcpServer;