/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import baseUrl from "./baseUrl.js";
function getMetadata(req, res, appEnvContext) {
    // RFC 8414 §3.3: the `issuer` MUST be identical to the origin that served
    // this metadata document. This document is always served from the MCP
    // server itself (mcpHost/.well-known/oauth-authorization-server), so the
    // issuer must be mcpHost in BOTH modes — otherwise clients like VS Code /
    // GitHub Copilot reject the metadata, fall back to default endpoint paths,
    // and the flow fails with a "bad state" / state-mismatch error.
    const host = appEnvContext.mcpHost;

    // The authorize/token endpoints, however, differ by mode:
    // - AUTHEXTERNAL === true  (oauthclient): the client brokers its own PKCE
    //   flow directly with SAS Logon, so advertise Viya's real endpoints.
    // - AUTHEXTERNAL === false (oauth): this server proxies the flow, so
    //   advertise this server's own /oauth/* endpoints.
    const base = appEnvContext.AUTHEXTERNAL === true
        ? appEnvContext.VIYA_SERVER + '/SASLogon'
        : appEnvContext.mcpHost;

    console.error(`[Note] Base URL for Authorization Server Metadata endpoints: ${base}`);
    console.error(`[Note] Issuer for Authorization Server Metadata: ${host}`);
    let metadata = {
        "issuer": host,
        "authorization_endpoint": `${base}/oauth/authorize`,
        "token_endpoint": `${base}/oauth/token`,
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "code_challenge_methods_supported": ["S256"],
        "scopes_supported": ["openid"]
    };
    console.error("===============================================================");
    console.error("[Note] Authorization Server Metadata:", metadata);
    console.error("===============================================================");
    return metadata;
};
export default getMetadata;