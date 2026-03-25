/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import getToken from "./getToken.js";
import refreshToken from "./refreshToken.js";
import refreshTokenOauth from "./refreshTokenOauth.js";

async function getLogonPayload(_appContext) {
  _appContext.contexts.logonPayload = await igetLogonPayload(_appContext);
  return _appContext.contexts.logonPayload;  
}

async function igetLogonPayload(_appContext) {
  console.error('[Info] Getting logon payload...',_appContext.AUTHFLOW);
  // Use cached logonPayload if available
  // This will cause timeouts if the token expires
  /*if (_appContext.contexts.logonPayload != null && _appContext.tokenRefresh !== true) {
    console.error("[Note] Using cached logonPayload information");
    return _appContext.contexts.logonPayload;
  }
    */

  if (_appContext.AUTHFLOW === 'code') {
    let oauthInfo = _appContext.contexts.oauthInfo;
    if (oauthInfo == null) {
      return null;
    }
    _appContext.contexts.oauthInfo = await refreshTokenOauth(_appContext, oauthInfo);
    if (_appContext.contexts.oauthInfo == null) {
      return null;
    }
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "server",
      token: _appContext.contexts.oauthInfo.accessToken,
      tokenType: "Bearer",
    }
    return  logonPayload;
  }

  // Use user supplied bearer token 
  if (_appContext.AUTHFLOW === "bearer") {
    if (_appContext.bearerToken == null) {
      console.error("[Error] AUTHFLOW set to bearer but no bearer token supplied");
      return null;
    }
    console.error("[Note] Using user supplied bearer token ");
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "server",
      token: _appContext.bearerToken,
      tokenType: "Bearer",
    };
    console.error("[Note] Bearer token in logonPayload ", _appContext.bearerToken);
    return logonPayload;
  }

  // Use user supplied refresh token-
  if (_appContext.AUTHFLOW === "refresh") {
    console.error("[Note] Using user supplied refresh token", _appContext.REFRESH_TOKEN); 
    let token = await refreshToken(_appContext,{token: _appContext.REFRESH_TOKEN, host: _appContext.VIYA_SERVER});
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "server",
      token: token, 
      tokenType: "Bearer",
    };

    return logonPayload;
  }
  
  if (_appContext.AUTHFLOW === "token") {
    console.error("[Note] Using token supplied by user");
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "server",
      token: _appContext.TOKEN,
      tokenType: "Bearer",
    };
    return logonPayload;
  }
 
  if (_appContext.AUTHFLOW === "none") {
    console.error(
      "[Note] No authentication flow selected. Proceeding without authentication."
    );
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "none",
    };
    return logonPayload;
  }

  if (_appContext.AUTHFLOW === "password") {
    let logonPayload = {
      host: _appContext.VIYA_SERVER,
      authType: "password",
      user: _appContext.USERNAME,
      password: _appContext.PASSWORD,
      clientID: _appContext.CLIENTID,
      clientSecret: _appContext.CLIENTSECRET,
    };

    return logonPayload;
  }

  // sascli auth flow - create from credentials file
  try {
    let { host, token } = await getToken(_appContext)
    console.error("[Note] Token refreshed ", host);
    let logonPayload = {
      host: host,
      authType: "server",
      token: token,
      tokenType: "Bearer",
    };
    return logonPayload;
  } catch (e) {
    console.error("[Error].... Error getting token: ", e);
    return null;
  }
}
export default getLogonPayload;
