/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";

import https from "https";
import cors from "cors";
import bodyParser from "body-parser";
import selfsigned from "selfsigned";
import openAPIJson from "./openAPIJson.js";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import tlogon from "./toolHelpers/tlogon.js";

import { getMetadata, authorize, callback, token, baseUrl } from "./oauthHandlers/index.js";
import processHeaders from "./processHeaders.js";

// setup express server

async function expressMcpServer(mcpServer, cache, baseAppEnvContext) {
  // setup for change to persistence session
  cache.del("headerCache");
  const app = express();
  let appStatus = false;
  app.use(express.urlencoded({ extended: true })); // MUST be before your routes
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

  // In-memory stores for the OAuth PKCE proxy flow (cleared on server restart)
  const pkceStore = new Map(); // ourState -> { codeVerifier, clientRedirectUri, clientState }
  const codeStore = new Map(); // ourCode   -> { access_token, refresh_token, expires_in }

  app.get('/.well-known/oauth-protected-resource', (req, res) => {
    res.json({
      resource: 'https://localhost:8080/mcp',
      authorization_servers: [`${baseAppEnvContext.VIYA_SERVER}`],
      scopes_supported: ['openid']
    });
  });

  app.get("/.well-known/oauth-authorization-server", async (req, res) => {
    console.error("[Note] Received request for OAuth authorization server metadata");
    let metadata = getMetadata(req, res, baseAppEnvContext);
    console.error("[Note] metadata ", metadata);
    return res.status(200).json(metadata);
  });

  // OAuth authorize — generates PKCE params, stores state, redirects to SAS Viya
  app.get("/oauth/authorize", async (req, res) => {
    console.error("[Note] Received request for /oauth/authorize");
    return authorize(req, res, baseAppEnvContext, pkceStore, codeStore);
  });

  // OAuth callback — receives code from SAS Viya, exchanges for tokens
  app.get("/callback", async (req, res) => {
    console.error("[Note] Received request for /callback with query parameters:");
    return await callback(req, res, pkceStore, codeStore, baseAppEnvContext);
  });

  // OAuth token endpoint — MCP client exchanges intermediate code for access token
  app.post("/oauth/token", (req, res) => {
    console.error("[Note] Received request for /oauth/token");
    return token(req, res, baseAppEnvContext, codeStore, cache);
  });

  // setup routes

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

  // health endpoint
  app.get("/health", (req, res) => {
    console.error("Received request for health endpoint");
    if (appStatus === false) {
      return res.status(500).json({ status: "not healthy" });
    }
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
    return processHeaders(req, res, next, cache, baseAppEnvContext);
  }

  // process mcp endpoint requests
  const handleRequest = async (req, res) => {
    let transport = null;
    let transports = cache.get("transports");
    console.error("=========================================================");
    console.error("Processing POST /mcp request");
    if (transports == null) {
      console.error("[Error] ***** transports cache is null. This is an error");
      transports = {};
      cache.set("transports", transports);
    }

    console.error("current transports in cache:", Object.keys(transports));
    try {

      let sessionId = req.headers["mcp-session-id"];
      console.error("[Note]Incoming session ID:", sessionId);
      let body = (req.body == null) ? 'no body' : JSON.stringify(req.body);
      console.error('[Note] Payload is ', body);
      if (/*!sessionId &&*/ isInitializeRequest(req.body)) {
        // create transport
        console.error("[Note] Initializing new transport for MCP session...");

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          enableDnsRebindingProtection: true,
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            console.error('Session initialized');
            console.error("[Note] Transport initialized with ID:", sessionId);
            transports[sessionId] = transport;
          },
        });
        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId && transports[transport.sessionId]) {
            delete transports[transport.sessionId];
          }
        };
        console.error("[Note] Connecting mcpServer to new transport...");
        await mcpServer.connect(transport);

        // Save transport data and app context for use in tools
        console.error('[Note] Connected to mcpServer');
        cache.set("transports", transports);
        console.error("=======================================================");
        return await transport.handleRequest(req, res, req.body);

        // cache transport

      } else if (sessionId != null) {
        console.error('[Note] Incoming session ID:', sessionId);
        transport = transports[sessionId];
        console.error("[Note] Found transport:", transport != null);
        if (transport == null) {
          // this can happen if client is holding on to old session id 
          console.error("[Error] No transport found for session ID:", sessionId, "Returning a 404 error with instructions for the user");
          res.status(404).send(`Invalid or missing session ID ${sessionId}. Please ensure your MCP client is configured to use the correct session ID returned in the 'mcp-session-id' header of the response from the /mcp endpoint.`);
          return;
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
        } else {
          let headerCache = cache.get("headerCache");
          _appContext = Object.assign(_appContext, headerCache);
          cache.set(sessionId, _appContext);
        }
        console.error("[Note] Using existing transport for session ID:", sessionId);
        console.error("==========================================================");
        await transport.handleRequest(req, res, req.body);
        return;
      }

      // initialize request

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
    console.error("=========================================================");
    console.error(`[Note] ${req.method} /mcp called`);
    const sessionId = req.headers["mcp-session-id"];
    console.error("[Note] SessionId:", sessionId);

    let transports = cache.get("transports");
    let transport = (sessionId == null) ? null : transports[sessionId];
    console.error("[Note] Transport found:", transport != null);
    if (!sessionId || transport == null) {
      res.status(404).send(`[Error] In ${req.method}: Invalid or missing session ID ${sessionId}`);
      return;
    }
    if (req.method === "GET") {
      await transport.handleRequest(req, res);
      return;
    }
    if (req.method === "DELETE" && sessionId != null) {
      console.error("[Note] Deleting transport and cache for session ID:", sessionId);
      delete transports[sessionId];
      cache.del(sessionId);
      res.status(201).send(`[Info] Deleted session ${sessionId}`);
    }
  }

  app.options("/mcp", (_, res) => res.sendStatus(204));
  app.post("/mcp", requireBearer, handleRequest);
  app.get("/mcp", handleGetDelete);
  app.delete("/mcp", handleGetDelete);
  app.get("/StartUp", (_req, res) => {
    console.error("===================================================================")
    console.error("Received request for Startup  endpoint. Current app status:", appStatus);
    console.error("===================================================================");
    if (appStatus === false) {
      return res.status(503).json({ status: "starting" });
    }
    return res.status(200).json({ status: "started" });
  });
  app.get("/tlogon", async (_req, res) => {
    console.error(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Testing logon");
    if (appStatus === false) {
      return res.status(503).json({ status: "not ready" });
    }
    let r = await tlogon(baseAppEnvContext);
    console.error(r);
    return res.status(200).json(r);
  });
  app.get("/status", (_req, res) => {
    console.error("===================================================================")
    console.error("Received request for status endpoint. Current app status:", appStatus);
    console.error("===================================================================");
    if (appStatus === false) {
      return res.status(503).json({ status: "not ready" });
    }
    return res.status(200).json({ status: "ready" });
  });

  app.get("/ready", (_req, res) => {
    console.error("===================================================================")
    console.error("Received request for ready endpoint. Current app status:", appStatus);
    console.error("===================================================================")
    if (appStatus === false) {
      return res.status(503).json({ status: "not ready" });
    }
    return res.status(200).json({ status: "ready" });
  });
  // Start the server
  let appEnvBase = cache.get("appEnvBase");

  const PORT = appEnvBase.PORT;

  // get user specified TLS options
  let appServer;

  // get TLS options
  if (appEnvBase.HTTPS === 'TRUE') {
    if (appEnvBase.tlsOpts == null) {
      appEnvBase.tlsOpts = await getTls(appEnvBase);
      console.error(Object.keys(appEnvBase.tlsOpts));
      appEnvBase.tlsOpts.requestCert = false;
      appEnvBase.tlsOpts.rejectUnauthorized = false;
      appEnvBase.contexts.appCert = appEnvBase.tlsOpts; /* just for completeness */
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
    appServer.listen(PORT, "0.0.0.0", () => {
      console.error(`[Note] Express server successfully bound to 0.0.0.0:${PORT}`);
      appStatus = true;
    });
  } else {
    console.error(`[Note] MCP Server listening on port ${PORT}`);
    console.error("[Note] Visit http://localhost:8080/health for health check");
    console.error(
      "[Note] Configure your mcp host to use http://localhost:8080/mcp to interact with the MCP server"
    );
    console.error("[Note] Press Ctrl+C to stop the server");
    try {
      appServer = app.listen(PORT, "0.0.0.0", () => {
        appStatus = true;
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
