/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";

import https from "https";
import cors from "cors";
//import rateLimit from "express-rate-limit";
//import helmet from "helmet";
import bodyParser from "body-parser";

import selfsigned from "selfsigned";
import openAPIJson from "./openAPIJson.js";
import fs from "fs";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";


// setup express server

async function expressMcpServer(mcpServer, cache, baseAppEnvContext) {
  // setup for change to persistence session
  cache.set("headerCache", {});

  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(
    cors({
      origin: "*",
      credentials: false,
      exposedHeaders: ["mcp-session-id"],
      allowedHeaders: [
        "Accept",
        "Authorization",
        "Content-Type",
        "If-None-Match",
        "Accept-language",
        "mcp-session-id",
      ],
    })
  );
  // app.use(helmet());
  app.use(bodyParser.json({ limit: process.env.JSON_LIMIT ?? "50mb" }));

  // setup routes
  app.get("/health", (req, res) => {
    console.error("Received request for health endpoint");
    let health = {
      name: "@sassoftware/mcp-server",
      version: baseAppEnvContext.version,
      description: "SAS Viya Sample MCP Server",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        apiMeta: "/apiMeta"
      },
      usage:
        "Use with MCP Inspector or compatible MCP clients like vscode or your own MCP client",
    };
    res.json(health);
  });
 
// Root endpoint info

app.get("/", (req, res) => {
  res.json({
    name: "SAS Viya Sample MCP Server",
    version: baseAppEnvContext.version,
    description: "SAS Viya Sample MCP Server",
    endpoints: {
      mcp: "/mcp",
      health: "/health",
      apiMeta: "/apiMeta"
    },
    usage: "Use with MCP Inspector or compatible MCP clients",
  });
});

// api metadata endpoint(for sas specs)
app.get("/apiMeta", (req, res) => {
  let spec = openAPIJson(baseAppEnvContext.version);
  res.json(spec);
});

// for azure container apps
app.get("/openapi.json", (req, res) => {
  let spec = openAPIJson(baseAppEnvContext.version);
  res.json(spec);
});

// handle processing of information in header.
function requireBearer(req, res, next) {


  // process any new header information

  // Allow different VIYA server per sessionid(user)
  let headerCache = {};
  if (req.header("X-VIYA-SERVER") != null) {
    console.error("[Note] Using user supplied VIYA server");
    headerCache.VIYA_SERVER = req.header("X-VIYA-SERVER");
  }

  // used when doing autorization via mcp client
  // ideal for production use
  const hdr = req.header("Authorization");
  if (hdr != null) {
    headerCache.bearerToken = hdr.slice(7);
    headerCache.AUTHFLOW = "bearer";
  }

  // faking out api key since Viya does not support 
  // not ideal for production
  const hdr2 = req.header("X-REFRESH-TOKEN");
  if (hdr2 != null) {
    headerCache.refreshToken = hdr2;
    headerCache.AUTHFLOW = "refresh";
  }
  cache.set("headerCache", headerCache);
  next();
}

// process mcp endpoint requests
const handleRequest = async (req, res) => {
  let transport;
  let transports = cache.get("transports");
  console.error("current transports in cache:", Object.keys(transports)); 
  try {

    let sessionId = req.headers["mcp-session-id"];

    // we have session id, get existing transport
    console.error('>>>>>>>>>>>>>> Received request for MCP endpoint with session ID:', req.method, sessionId);
    if (sessionId != null) {
      console.error("Looking for transport with session ID:", sessionId);
      transport = transports[sessionId];
      console.error("Found transport:", transport != null);
      if (transport == null) {
        throw new Error(`No transport found for session ID: ${sessionId}`);
      }

      // post the curren session - used to pass _appContext to tools
      cache.set("currentId", sessionId);

      // get app context for session
      let _appContext = cache.get(sessionId);

      //if first prompt on a sessionid, create app context
      if (_appContext == null) {

        let appEnvTemplate = cache.get("appEnvTemplate");
        let headerCache = cache.get("headerCache");
        _appContext = Object.assign({}, appEnvTemplate, headerCache);
        cache.set(sessionId, _appContext);
      }
      console.error("[Note] Using existing transport for session ID:", sessionId);

      await transport.handleRequest(req, res, req.body);
    }

    // initialize request
    else if (!sessionId && isInitializeRequest(req.body)) {
      // create transport
      console.error("[Note] Initializing new transport for MCP session...");
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
        },
      });
      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      console.error("[Note] Connecting mcpServer to new transport...");
      console.error('connecting mcp Server with session ID:', transport.sessionId);
      console.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> connecting mcp Server with session ID:', transport.sessionId);
      await mcpServer.connect(transport);

      // Save transport data and app context for use in tools
      console.error('connected mcpServe with session ID:', transport.sessionId);
      cache.set("transports", transports);
      await transport.handleRequest(req, res, req.body);
      // cache transport
  
    }
  }
  catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: JSON.stringify(error),
        },
        id: null,
      });
    }
    return;
  }
};
const handleGetDelete = async (req, res) => {
  console.error(req.method, "/mcp called");
  const sessionId = req.headers["mcp-session-id"];
  console.error("Handling GET/DELETE for session ID:", sessionId);
  let transports = cache.get("transports");
  let transport = (sessionId == null) ? null : transports[sessionId];
  if (!sessionId || transport == null) {
    res.status(400).send(`[Error] In ${req.method}: Invalid or missing session ID ${sessionId}`);
    return;
  }
  await transport.handleRequest(req, res);
  if (req.method === "DELETE" && sessionId != null) {
    console.error("Deleting transport and cache for session ID:", sessionId);
    delete transports[sessionId];
    cache.del(sessionId);
  }
}

app.options("/mcp", (_, res) => res.sendStatus(204));
app.post("/mcp", requireBearer, handleRequest);
app.get("/mcp", handleGetDelete);
app.delete("/mcp", handleGetDelete);

// Start the server
let appEnvBase = cache.get("appEnvBase");

const PORT = appEnvBase.PORT;

// get user specified TLS options
let appServer;

// get TLS options
if (appEnvBase.HTTPS === 'TRUE') {
  //appEnvBase.tlsOpts = getOpts(appEnvBase);
  if (appEnvBase.tlsOpts == null) {
    appEnvBase.tlsOpts = await getTls(appEnvBase);
    console.error(Object.keys(appEnvBase.tlsOpts));
    appEnvBase.tlsOpts.requestCert = false;
    appEnvBase.tlsOpts.rejectUnauthorized = false;
  }

  cache.set("appEnvBase", appEnvBase);

  console.error(`[Note] MCP Server listening on port ${PORT}`);
  console.error(
    "[Note] Visit https://localhost:8080/health for health check"
  );
  console.error(
    "[Note] Configure your mcp host to use https://localhost:8080/mcp to interact with the MCP server"
  );
  console.error("[Note] Press Ctrl+C to stop the server");

  appServer = https.createServer(appEnvBase.tlsOpts, app);
  appServer.listen(PORT, "0.0.0.0", () => { });
} else {
  console.error(`[Note] MCP Server listening on port ${PORT}`);
  console.error("[Note] Visit http://localhost:8080/health for health check");
  console.error(
    "[Note] Configure your mcp host to use http://localhost:8080/mcp to interact with the MCP server"
  );
  console.error("[Note] Press Ctrl+C to stop the server");
  try {
    appServer = app.listen(PORT, "0.0.0.0", () => {
      console.error(
        `[Note] Express server successfully bound to 0.0.0.0:${PORT}`
      );

    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}
process.on("SIGTERM", () => {
  console.error("Server closed");
  if (appServer != null) {
    appServer.close(() => { });
  }
  process.exit(0);
});
process.on("SIGINT", () => {
  console.error("Server closed");
  if (appServer != null) {
    appServer.close(() => { });
  }
  process.exit(0);
});

// create unsigned TLS cert
async function getTls(appEnv) {
  let tlscreate =
    appEnv.TLS_CREATE == null
      ? "TLS_CREATE=C:US,ST:NC,L:Cary,O:SAS Institute,OU:STO,CN:localhost,ALT:na.sas.com"
      : appEnv.TLS_CREATE;
  let subjt = tlscreate.replaceAll('"', "").trim();
  let subj = subjt.split(",");

  let d = {};
  subj.map((c) => {
    let r = c.split(":");
    d[r[0]] = r[1];
    return { value: r[1] };
  });

  let attr = [
    {
      name: "commonName",
      value: d.CN,
    },
    {
      name: "countryName",
      value: d.C,
    },
    {
      shortName: "ST",
      value: d.ST,
    },
    {
      name: "localityName",
      value: d.L,
    },
    {
      name: "organizationName",
      value: d.O,
    },
    {
      shortName: "OU",
      value: d.OU,
    },
  ];

  let pems = selfsigned.generate(attr);
  // selfsigned generates a new keypair
  let tls = {
    cert: pems.cert,
    key: pems.private,
  };
  console.error("Generated self-signed TLS certificate");
  return tls;
}
}

export default expressMcpServer;
