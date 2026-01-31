import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

async function handleRequest(mcpServer, cache, req, h, credentials) {
  let headerCache = {};
  let transport;
  let transports = cache.get("transports");
  try {

    headerCache = customHeaders(req, h);
    let sessionId = req.headers["mcp-session-id"];

    // we have session id, get existing transport

    if (sessionId != null) {
      /* existing transport */
      transport = transports[sessionId];
      if (transport == null) {
        h.response({ isError: true, content: [{ type: 'text', text: 'Session not found. Please re-initialize the MCP client.' }] }).code(400).type('application/json');
        return h.abandon;
      }
    }
      
    if (sessionId != null && transport != null) {
      // post the curren session - used to pass _appContext to tools
      cache.set("currentId", sessionId);

      // get app context for session
      let _appContext = cache.get(sessionId);

      //if first prompt on a sessionid, create app context

      if (_appContext == null) {
        console.error("[Note] Creating new app context for session ID:", sessionId);
        let appEnvTemplate = cache.get("appEnvTemplate");
        _appContext = Object.assign({}, appEnvTemplate, headerCache);
        _appContext.contexts.oauthInfo = credentials;
        cache.set(sessionId, _appContext);
      }
      console.error("[Note] Using existing transport for session ID:", sessionId);
      return await transport.handleRequest(req.raw.req, req.raw.res, req.payload);
    }

    // initialize request
    else if (!sessionId && isInitializeRequest(req.payload)) {
      // create transport
      console.error("[Note] Initializing new transport for MCP request...");
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
      await mcpServer.connect(transport);
   
      // Save transport data and app context for use in tools
       cache.set("transports", transports);
      return await transport.handleRequest(req.raw.req, req.raw.res, req.payload);
      // cache transport


    }
  }
  catch (error) {
    console.error("Error handling MCP request:", error);
    let r = { isError: true, content: [{ type: 'text', text: 'Internal server error occurred while processing the request.' }] };
    return h.response(r).code(500).type('application/json');
  }
  function customHeaders(req, h) {

    // process any new header information

    // Allow different VIYA server per sessionid(user)
    let headerCache = {};
    if (req.headers["X-VIYA-SERVER"] != null) {
      console.error("[Note] Using user supplied VIYA server");
      headerCache.VIYA_SERVER = req.header("X-VIYA-SERVER");
    }

    // used when doing autorization via mcp client
    // ideal for production use
    const hdr = req.headers["Authorization"];
    if (hdr != null) {
      headerCache.bearerToken = hdr.slice(7);
      headerCache.AUTHFLOW = "bearer";
    }

    // faking out api key since Viya does not support 
    // not ideal for production
    const hdr2 = req.headers["X-REFRESH-TOKEN"];
    if (hdr2 != null) {
      headerCache.refreshToken = hdr2;
      headerCache.AUTHFLOW = "refresh";
    }
    return headerCache;
  }
};
export default handleRequest;