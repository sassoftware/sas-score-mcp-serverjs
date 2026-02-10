/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
function openAPIJson(version) {
  let spec = {
  "swagger": "2.0",
  "info": {
    "title": "sas-score-mcp-serverjs  API",
    "version": version,
    "description": "sas-score-mcp-serverjs is a mcp server for SAS Viya"
  },
  "host": "localhost:8080",
  "basePath": "/",
  "schemes": ["http", "https"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "paths": {
    "/health": {
      "get": {
        "summary": "Health check",
        "description": "Returns health and version information.",
        "responses": {
          "200": {
            "description": "Health information",
            "schema": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "version": { "type": "string" },
                "description": { "type": "string" },
                "endpoints": { "type": "object" },
                "usage": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "/apiMeta": {
      "get": {
        "summary": "API metadata",
        "description": "Returns the OpenAPI specification for this server.",
        "responses": {
          "200": {
            "description": "OpenAPI document",
            "schema": { "type": "object" }
          }
        }
      }
    },
     "/openapi.json": {
      "get": {
        "summary": "API metadata",
        "description": "Returns the OpenAPI specification for this server.",
        "responses": {
          "200": {
            "description": "OpenAPI document",
            "schema": { "type": "object" }
          }
        }
      }
    },
    "/mcp": {
      "options": {
        "summary": "CORS preflight",
        "description": "CORS preflight endpoint.",
        "responses": {
          "204": { "description": "No Content" }
        }
      },
      "post": {
        "summary": "MCP request",
        "description": "Handles MCP JSON-RPC requests.",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": { "type": "object" }
          },
          {
            "name": "Authorization",
            "in": "header",
            "required": false,
            "type": "string",
            "description": "Bearer token for authentication"
          },
          {
            "name": "X-VIYA-SERVER",
            "in": "header",
            "required": false,
            "type": "string",
            "description": "Override VIYA server"
          },
          {
            "name": "X-REFRESH-TOKEN",
            "in": "header",
            "required": false,
            "type": "string",
            "description": "Refresh token for authentication"
          },
          {
            "name": "mcp-session-id",
            "in": "header",
            "required": false,
            "type": "string",
            "description": "Session ID"
          }
        ],
        "responses": {
          "200": {
            "description": "MCP response",
            "schema": { "type": "object" }
          },
          "500": {
            "description": "Server error",
            "schema": { "type": "object" }
          }
        }
      },
      "get": {
        "summary": "Get MCP session",
        "description": "Retrieves information for an MCP session.",
        "parameters": [
          {
            "name": "mcp-session-id",
            "in": "header",
            "required": true,
            "type": "string",
            "description": "Session ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Session information",
            "schema": { "type": "object" }
          },
          "400": {
            "description": "Invalid or missing session ID"
          }
        }
      },
      "delete": {
        "summary": "Delete MCP session",
        "description": "Deletes an MCP session.",
        "parameters": [
          {
            "name": "mcp-session-id",
            "in": "header",
            "required": true,
            "type": "string",
            "description": "Session ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Session deleted",
            "schema": { "type": "object" }
          },
          "400": {
            "description": "Invalid or missing session ID"
          }
        }
      }
    }
  }
};
  spec.info.version = version;
  return spec;
};
export default openAPIJson;