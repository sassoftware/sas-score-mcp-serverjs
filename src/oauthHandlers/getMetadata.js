/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import baseUrl from "./baseUrl.js";
function getMetadata(req, res, appEnvContext) {
    let base = '';
    let host = '';
    if (appEnvContext.AUTHEXTERNAL === true) {
        base = appEnvContext.VIYA_SERVER + '/SASLogon';
        host = appEnvContext.VIYA_SERVER;
    } else {
        base = appEnvContext.mcpHost;
        host = appEnvContext.mcpHost;
    } 
    console.error(`[Note] Base URL for Authorization Server Metadata: ${base}`);
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