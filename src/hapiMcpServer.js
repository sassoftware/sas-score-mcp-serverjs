/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import appServer from "@sassoftware/viya-serverjs";
import handleRequest from "./handleRequest.js";
import handleGetDelete from "./handleGetDelete.js";
import urlOpen from "./urlOpen.js";

async function hapiMcpServer(mcpServer, cache, baseAppEnvContext) {

  console.error('Starting Hapi MCP server...');
  console.error("[Note]: Hapi MCP server started...", baseAppEnvContext.AUTHFLOW);
  process.env.REDIRECT=`/status`;
 let r = await appServer.asyncCore(mcpHandlers, true, 'app', null);
 console.error('Hapi server running result:', r);
  if (baseAppEnvContext.AUTHFLOW === 'code' && baseAppEnvContext.AUTOLOGON !== 'FALSE') {
    await urlOpen(r);
  }
  return r;
  
  // add MCP handlers to the app server

  function mcpHandlers() {
    function getHtml() {
      return `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>sas-score-mcp-server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            height: 100vh;
            overflow: hidden;
        }

        dialog {
            position: fixed;
            left: 50%;
            right: auto;
            top: 0;
            transform: translateX(-50%);
            width: fit-content;
            height: fit-content;
            border: none;
            border-radius: 4px;
            padding: 16px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.1);
        }

        dialog h2 {
            font-size: 18px;
            margin-bottom: 12px;
            color: #000;
        }

        dialog p {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: fit-content;
            line-height: 1.6;
            color: #333;
            word-wrap: break-word;
            white-space: pre-wrap;
        }

        /* Window styling to show it's 10px larger than dialog */
        body::before {
            display: none;
        }
    </style>
</head>
<body>
    <dialog open>
        <h2>sas-score-mcp-server</h2>
        <p>The mcp server is now ready for use. </p>
        <p>You can close this window</p>
        <p>For information on the tools see this documentation link:</p>
            <a href="https://github.com/sassoftware/sas-score-mcp-serverjs/wiki   " target="_blank">Summary of tools  </a>
    </p>
    </dialog>
</body>
</html>
`;
 
    }
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
          tags: ["mcp"],
        }
      },
      {
        method: ["GET"],
        path: `/${baseAppEnvContext.contexts.APPNAME}/status`,
        options: {
          handler: async (req, h) => {
            let ht = getHtml();
            return h.response(ht).code(200).type('text/html');
           // return h.abandon;
          },
          auth: false,
          description: "Help",
          notes: "Help",
          tags: ["mcp"],
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