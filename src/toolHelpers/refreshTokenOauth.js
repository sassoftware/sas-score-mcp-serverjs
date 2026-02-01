 /*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
 import { Agent, fetch } from 'undici';
 import getOpts from './getOpts.js';
 async function refreshTokenOauth(_appContext, oauthInfo ){
 
    const url = `${process.env.VIYA_SERVER}/SASLogon/oauth/token`;
    let opts = getOpts(_appContext);

    const agent = new Agent({
      connect: opts
    });
    
    let bodyObject = {
      grant_type: 'refresh_token',
      refresh_token: oauthInfo.refreshToken,
      client_id: _appContext.CLIENTID,
      client_secret: _appContext.CLIENTSECRET
    }
    const body = new URLSearchParams(bodyObject);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          dispatcher: agent
        },
        body: body.toString()
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[Error] Failed to refresh token: ', error);
        throw new Error(error);
      }

      const data = await response.json();
      let newauthInfo = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      }
      return newauthInfo;
    } catch (err) {
      console.error('[Error] Failed to refresh token: ', err);
      return null;
    }
  }
  
  export default refreshTokenOauth;