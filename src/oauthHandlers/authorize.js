/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { randomBytes, createHash } from "node:crypto";
import baseUrl from "./baseUrl.js";

function authorize(req, res, appContext, pkceStore, codeStore) {
    const { response_type, redirect_uri, state, scope } = req.query;
    console.error("===============================================================");
    if (appContext.AUTHEXTERNAL === true) {
        console.error('*************************************************************');
        console.error("[Error] Received request for /authorize endpoint with external authorization expected");
        console.error('*************************************************************');
    }
    console.error("[NOTE] query parameters:", { response_type, redirect_uri, state, scope });
    if (response_type !== "code") {
        return res.status(400).json({ error: "unsupported_response_type" });
    }
    if (!redirect_uri) {
        return res.status(400).json({ error: "invalid_request", error_description: "redirect_uri is required" });
    }

    const codeVerifier = randomBytes(64).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const ourState = randomBytes(16).toString("hex");

    pkceStore.set(ourState, { codeVerifier, clientRedirectUri: redirect_uri, clientState: state, codeChallenge });

    const callbackUri = appContext.mcpHost + '/callback';
    console.error("[Note] callbackUri:", callbackUri);
    let urlConfig = {
        response_type: "code",
        client_id: appContext.CLIENTID,
        redirect_uri: callbackUri,
        scope: "openid",
        state: ourState,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    }
    if (appContext.PKCE !== "TRUE") {
        urlConfig.client_secret = appContext.CLIENTSECRET;
    }
    console.error("[Note] Params for SAS Viya authorization request:", urlConfig);
    const params = new URLSearchParams(urlConfig);
    console.error("================================================================");
    return res.redirect(`${appContext.VIYA_SERVER}/SASLogon/oauth/authorize?${params}`);
}
export default authorize;