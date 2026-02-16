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
      "GET": {
        "summary": "Health check",
        "operationId": "GetHealth",
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
      "GET": {
        "summary": "API metadata using apiMeta",
        "operationId": "GetApiMeta",
        "responses": {
          "200": {
            "description": "OpenAPI document",
            "schema": { "type": "object" }
          }
        }
      }
    },
     "/openapi.json": {
      "GET": {
        "summary": "API metadata using openapi.json",
        "operationId": "GetOpenApiJson",
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
      "OPTIONS": {
        "summary": "CORS preflight",
        "operationId": "OptionsMcp",
        "description": "CORS preflight endpoint.",
        "responses": {
          "204": { "description": "No Content" }
        }
      },
      "POST": {
        "summary": "MCP request",
        "operationId": "PostMcp",
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
      "GET": {
        "summary": "Get MCP session",
        "operationId": "GetMcp",
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
      "DELETE": {
        "summary": "Delete MCP session",
        "operationId": "DeleteMcp",
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