 /*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
 import { Agent, fetch } from 'undici';

 async function refreshToken(_appContext,params) {
  let {host, token} = params;
    let url = `${host}/SASLogon/oauth/token`;
    console.error('[Info] url:', url);
    console.error('[Info] Refresh token...', token);

    let opts =  _appContext.contexts.appCert;
    console.error('[Info] TLS options for token refresh:', opts);
    
    const agent = new Agent({
      connect: opts
    });
  
   // const agent = new https.Agent(opts);
    console.error('[Info] Refreshing token...', token);
    const ibody = {
      grant_type: 'refresh_token',
      refresh_token: token,
      client_id: 'sas.cli'
    };
    console.error('[Info] Refresh token request body:', JSON.stringify(ibody));
    let body = new URLSearchParams(ibody);
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
      console.error('[Info] Token refreshed successfully: ', data.access_token);
      return data.access_token;
    } catch (err) {
      console.error('[Error] Failed to refresh token: ', err);
      throw err;
    }
  }
  
  export default refreshToken;