import { start } from "node:repl";

/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import baseUrl from "./oauthHandlers/baseUrl.js";
function processHeaders(req, res, next, cache, appContext) {

  // process any new header information
  debugger;
  console.error("=======================================================");
  console.error("Processing headers for incoming request to /mcp endpoint");
  // Allow different VIYA server per sessionid(user)
  cache.del("headerCache");
  let headerCache = {};
  if (req.header("X-VIYA-SERVER") != null) {
    console.error("[Note] Using user supplied VIYA server");
    headerCache.VIYA_SERVER = req.header("X-VIYA-SERVER");
  }

  // fakeapi key since Viya does not support it
  // not ideal for production, just for testing
  const hdr2 = req.header("X-REFRESH-TOKEN");
  if (hdr2 != null) {
    headerCache.REFRESH_TOKEN = hdr2;
    headerCache.AUTHFLOW = "refresh";
    console.error("[Note] Using user supplied refresh token for authorization");
  }

  // Oauth flow
  const hdr = req.header("Authorization");
  //for now, ignore Authorization if authflow is not bearer
  let token = (hdr != null) ? hdr.slice(7) : null;
  //console.error("[Note] Authorization token", token);

  if (appContext.AUTHFLOW === 'bearer') {
    debugger;
    let startAuth = false;
    if (appContext.AUTHEXTERNAL === true) {
      console.error("[Note] Expecting external authorization"); 
      if (token == null) {
        console.error("[Error] Expected Authorization token but none provided.");
        return res.status(403).json({
          error: "unauthorized",
          error_description: "[Error] Expected Authorization token but none provided."
        });
      }
      headerCache.bearerToken = token;
    } else  if (token == null) {
      console.error("[Note] No Authorization token provided in header.");
       startAuth = true;
    } else {
      console.error("[Note] Checking token against cache", token);
      let tokenlist = cache.get("tokenlist");
      let tokenData = tokenlist[token];
      if (tokenData == null) {
        return res.status(403).json({
          error: "unauthorized",
          error_description: "[Error] Expired token. Clear token and try again."
        });
      } else {
        token = tokenData.access_token;
        headerCache.bearerToken = token;
      }
    }
    if (startAuth === true) {
      // start oauth flow process
      console.error(`[Note] No Authorization header provided.
                            Returning 401 with instructions for obtaining a token.`);
      const base = baseUrl(appContext);
      res.set(
        "WWW-Authenticate",
        `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource", scope="openid"`
      );
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Bearer token required."
      });
      // start auth flow process since no token provided in header and we are not configured for external token
    }
  }
 // console.error("Header cache after processing:", headerCache);
  cache.set("headerCache", headerCache);
  next();
}

export default processHeaders;