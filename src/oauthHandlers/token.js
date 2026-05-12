/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
function token(req, res, appContext, codeStore, cache) {
  console.error("===============================================================");
  console.error("[Note] at /token endpoint");
  console.error("[Note] Request headers:", req.headers);
  console.error("[Note] Handling token request with body:", req.body);

  const { grant_type, code } = req.body;
  console.error("[Note] OAuth token request received for code:", code);
  console.error("[Note] Grant type:", grant_type);

  const tokenData = codeStore.get(code);
  if (!tokenData) {
    return res.status(400).json({ error: "Invalid_code", error_description: "Invalid or expired authorization code" });
  }
  console.error("[Note] Retrieved token data for code:", Object.keys(tokenData));
 
  let payload = {
    access_token: code, // tokenData.access_token,
    token_type: "Bearer",
    expires_in: tokenData.expires_in,
    scope: "openid" // You can include scopes if you have them, e.g., tokenData.scope
   // scope: tokenData.scope,
  };
  let tokenlist = cache.get("tokenlist");
  tokenData.refreshAt = Date.now() + tokenData.expires_in * 1000; // Set refresh time based on expires_in
  tokenlist[code] = tokenData;
  cache.set("tokenlist", tokenlist);

  codeStore.delete(code); // Invalidate the code after use
  console.error("[Note] Returning token to client");
  console.error("[Note] Token sent to client:", JSON.stringify(payload, null, 2));
 
  console.error("============================================================")
  return res.status(200).json(payload);
}

export default token;