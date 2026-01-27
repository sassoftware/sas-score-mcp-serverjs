/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Creates and configures an MCP server instance.
 * @param {Object} cache - The session cache to store the MCP server instance.
 * @returns {Promise<McpServer>} The configured MCP server instance.  
 * @example
 * Notes: Handles both http and stdio transports scenarios
 * 
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeTools from "./toolSet/makeTools.js";
import getLogonPayload from "./toolHelpers/getLogonPayload.js";

async function createMcpServer(cache, _appContext) {

  let mcpServer = new McpServer(
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
  let toolSet = makeTools(_appContext);

  //wrapping tool handler to pass _appContext
  //can be ignored or used as needed.

  const wrapf = (cache, builtin) => async (args) => {
    let currentId = cache.get('currentId');
    let _appContext = cache.get(currentId);
    let params;
    // get Viya token 

    let errorStatus = cache.get('errorStatus');
    if (errorStatus) {
      return { isError: true, content: [{ type: 'text', text: errorStatus }] }
    };
    if (_appContext.AUTHFLOW === 'code' && _appContext.contexts.oauthInfo == null) {
      return { isError: true, content: [{ type: 'text', text: 'Please visit https://localhost:8080/mcpserver to connect to Viya. Then try again.' }] }
    }
    console.error("Getting logon payload for tool with session ID:", currentId);
    _appContext.contexts.logonPayload = await getLogonPayload(_appContext);
    if (_appContext.contexts.logonPayload == null) {
      return { isError: true, content: [{ type: 'text', text: 'Unable to get authentication token for SAS Viya. Please check your configuration.' }] }

    }

    // create enhanced appContext for tool
    if (args == null) {
      params = { _appContext: _appContext.contexts };
    } else {
      params = Object.assign({}, args, { _appContext: _appContext.contexts });
    }

    // call the actual tool handler
    debugger;
    let r = await builtin(params);
    return r;
  }

  // Register the tools with brand prefix
  console.error(`[Note] Brand: ${_appContext.brand}`);
  let toolNames = [];
  toolSet.forEach((tool, i) => {
    let toolName = _appContext.brand + '-' + tool.name;
    // console.error(`\n[Note] Registering tool ${i + 1} : ${toolName}`);
    let toolHandler = wrapf(cache, tool.handler);

    mcpServer.tool(toolName, tool.description, tool.schema, toolHandler);
    toolNames.push(toolName);
  });
  console.error(`[Note] Registered ${toolSet.length} tools: ${toolNames}`);
  cache.set("mcpServer", mcpServer);
  return mcpServer;
}

export default createMcpServer;
