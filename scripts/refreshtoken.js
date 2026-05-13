/*
* Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
* SPDX-License-Identifier: Apache-2.0
*/
import { Agent, fetch } from 'undici';
import fs from "fs";

refreshToken()
.then (token => {
  console.log(token);
  fs.writeFileSync('token.txt', token, 'utf8');
})
.catch (err => {
  console.error('[Error] Failed to refresh token: ', err);
});
async function refreshToken(){
  let host = process.env.VIYA_SERVER;
  let token = "8afd75c0df5141b1a1d27dfe9db06fa5-r";
  let url = `${host}/SASLogon/oauth/token`;

  let aconnect = {
    rejectUnauthorized: false  // or false, if you really want to bypass checks
  }

  const agent = new Agent(aconnect);

  console.error('[Info] Refreshing token...', token);
  const ibody = {
    grant_type: 'refresh_token',
    refresh_token: token,
    client_id: 'sas.cli'
  };

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
    return data.access_token;
  } catch (err) {
    console.error('[Error] Failed to refresh token: ', err);
    throw err;
  }
}