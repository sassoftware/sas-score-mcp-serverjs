/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import https from "https";
import selfsigned from "selfsigned";
import openAPIJson from "./openAPIJson.js";
import makeServerFactory from "./createMcpServer.js";

import {
  createMcpExpressApp,
  requireBearerAuth,
  mcpAuthMetadataRouter,
  getOAuthProtectedResourceMetadataUrl,
} from "@modelcontextprotocol/express";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";

import tlogon from "./toolHelpers/tlogon.js";

// Pure MCP-spec-2026-07-28 server: no legacy (2025-era) protocol support, and
// no MCP session tracking of any kind — the SDK builds a fresh McpServer per
// request via makeServerFactory and answers each request independently.

function buildOAuthMetadata(baseAppEnvContext) {
  return {
    issuer: baseAppEnvContext.VIYA_SERVER,
    authorization_endpoint: `${baseAppEnvContext.VIYA_SERVER}/SASLogon/oauth/authorize`,
    token_endpoint: `${baseAppEnvContext.VIYA_SERVER}/SASLogon/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["openid"],
  };
}

// Minimal OAuthTokenVerifier: the caller already holds a real,
// externally-obtained bearer token (its own OAuth flow, a static token, or a
// sascli/refresh-managed token) — trust it as supplied, decoding just enough
// to get an expiresAt (required by the SDK's bearer-auth checks) when it's a
// JWT. The token is only actually validated when it's used against Viya.
function makeTokenVerifier() {
  return {
    async verifyAccessToken(incomingToken) {
      let expiresAt;
      try {
        const payload = JSON.parse(Buffer.from(incomingToken.split(".")[1], "base64url").toString("utf8"));
        if (typeof payload.exp === "number") {
          expiresAt = payload.exp;
        }
      } catch {
        // not a JWT (or unparsable) — fall through to the default below
      }
      if (expiresAt == null) {
        expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      }
      return { token: incomingToken, clientId: "external", scopes: [], expiresAt };
    },
  };
}

async function expressMcpServer(baseAppEnvContext) {
  const app = createMcpExpressApp({
    host: baseAppEnvContext.contexts.APPHOST || "0.0.0.0",
    jsonLimit: process.env.JSON_LIMIT ?? "50mb",
  });
  let appStatus = false;

  // legacy: 'reject' — this server speaks only the 2026-07-28 MCP revision;
  // 2025-era (legacy) requests are answered with an unsupported-protocol
  // error instead of being served.
  const handler = createMcpHandler(makeServerFactory(baseAppEnvContext), { legacy: "reject" });

  const requireAuth = baseAppEnvContext.AUTHFLOW === "bearer"
    ? requireBearerAuth({
        verifier: makeTokenVerifier(),
        resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(new URL(`${baseAppEnvContext.mcpHost}/mcp`)),
      })
    : (_req, _res, next) => next();

  if (baseAppEnvContext.AUTHFLOW === "bearer") {
    app.use(
      mcpAuthMetadataRouter({
        oauthMetadata: buildOAuthMetadata(baseAppEnvContext),
        resourceServerUrl: new URL(`${baseAppEnvContext.mcpHost}/mcp`),
      })
    );
  }

  // createMcpExpressApp already parses the JSON body (express.json()), so the
  // body stream is drained by the time toNodeHandler would see it — pass the
  // already-parsed req.body through explicitly instead of letting it re-read.
  // Route every method through the handler; the legacy:'reject' handler
  // itself answers GET/DELETE (2025-era session operations) with the
  // unsupported-protocol error, POST is the only method that does anything.
  const mcpNodeHandler = toNodeHandler(handler);
  app.all("/mcp", requireAuth, (req, res) => mcpNodeHandler(req, res, req.body));

  // Root endpoint info
  app.get("/", (req, res) => {
    res.json({
      name: "SAS Viya Sample MCP Server",
      version: baseAppEnvContext.version,
      description: "SAS Viya Sample MCP Server",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        apiMeta: "/apiMeta",
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
        apiMeta: "/apiMeta",
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
  let appEnvBase = baseAppEnvContext;

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
