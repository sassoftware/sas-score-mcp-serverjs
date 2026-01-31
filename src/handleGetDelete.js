/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

async function handleGetDelete(mcpServer, cache, req, h) {
    const sessionId = req.headers["mcp-session-id"];
    console.error(`Handling ${req.method} for session ID:`, sessionId);
    let transports = cache.get("transports");
    let transport = transports[sessionId];
    if (!sessionId || transport == null) {
        console.error('[Note] Looks like a fresh start - no session id or transport found');
        h.abandon;
    }

     if (req.method === "GET") {
        // You can customize the response as needed
        await transport.handleRequest(req.raw.req, req.raw.res, req.payload);
        return h.abandon;
     }

    if (req.method === "DELETE") {
        console.error("Deleting transport and cache for session ID:", sessionId);
        delete transports[sessionId];
        cache.del(sessionId);
        return h.response(`[Info] In DELETE: Session ID ${sessionId} deleted`).code(201);
    }

    
}
export default handleGetDelete;