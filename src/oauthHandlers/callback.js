import baseUrl from "./baseUrl.js";
import { Agent, fetch as undiciFetch } from "undici";
import { randomUUID } from "node:crypto";
async function callback(req, res, pkceStore, codeStore, appContext) {
  console.error("===============================================================");
  console.error("[Note] OAuth callback");
  console.error(req.query);
  const {code, state} = req.query;

  console.error("[Note] query parameters:", code, state);
  if (!code) {  
    return res.status(400).send("Missing code parameter");
  }

  const pending = pkceStore.get(state);
  if (!pending) {
    return res.status(400).send("Invalid or expired state parameter");
  }
  pkceStore.delete(state);

  // const callbackUri = `${baseUrl(appContext)}/callback`;
  const callbackUri = appContext.mcpHost + '/callback';
  console.error("[Note] callbackUri for token exchange:", callbackUri);
  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: appContext.CLIENTID,
      code: code,
      redirect_uri: callbackUri,
      code_verifier: pending.codeVerifier
    }).toString();
   
    console.error("[Note] Token request body:", body.toString());
  
    let connectOpts = {
      rejectUnauthorized: false  // or false, if you really want to bypass checks
    }
    if (appContext.contexts.viyaCert != null && appContext.contexts.viyaCert.ca != null) {
      connectOpts.ca = appContext.contexts.viyaCert.ca;
    }
    const agent = new Agent({ connect: connectOpts });
    console.error("[Note] Initiating token exchange with SAS Viya");
    let clientID= appContext.CLIENTID;
    let h = buildBasicAuthFromClientId(clientID);
    // console.error("[Note] Authorization header for token request:", h);
    const response = await undiciFetch(`${appContext.VIYA_SERVER}/SASLogon/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: body,
      dispatcher: agent,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Error] SAS Viya token exchange failed:", errText);
      return res.status(502).send("Token exchange with SAS Viya failed");
    }

    const tokens = await response.json();
   // console.error("[Note] Received tokens from SAS Viya:", tokens);
    const ourCode = randomUUID();
    codeStore.set(ourCode, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    const redirectParams = new URLSearchParams({ code: ourCode , state: pending.clientState});
    //pending.clientState is the original state from the MCP client, which we should pass back to it for correlation

    // pending.clientRedirectUri is the original redirect URI from the MCP client, 
    // which was part of the payload from the client to /oauth/authorize
    // we trust since it was associated with the valid PKCE state
    console.error("[Note] OAuth callback complete, redirecting to MCP client");
    console.error(pending.clientRedirectUri.toString())
    return res.redirect(`${pending.clientRedirectUri}?${redirectParams}`);
  } catch (err) {
    console.error("[Error] OAuth callback handler error:", err);
    return res.status(500).send("Internal server error during token exchange");
  }

  function buildBasicAuthFromClientId(clientId) {
    const raw = `${clientId}:`;   // empty client_secret
    const encoded =
      typeof btoa === "function"
        ? btoa(raw)
        : Buffer.from(raw).toString("base64");

    return `Basic ${encoded}`;
  }

}
export default callback;