/**
 * SAS Viya PKCE Authorization Flow
 *
 * Uses the Authorization Code flow with PKCE (RFC 7636).
 * Starts a local HTTP server to capture the redirect callback.
 *
 * Usage:
 *   node sas-viya-pkce-auth.js
 *
 * Prerequisites:
 *   - A SAS Viya client registered with:
 *       grant_types: authorization_code
 *       redirect_uri: http://localhost:3000/callback
 *       PKCE enabled (no client_secret required)
 */

import http from "http";
import https from "https";
import crypto from "crypto";
import url from "url";

    let VIYA_SERVER=process.env.VIYA_SERVER;
    let PORT=8080;
    let CLIENTID='pkcemcp';
    // ── Configuration ────────────────────────────────────────────────────────────
  
    const CONFIG = {
        authBaseUrl: `${VIYA_SERVER}/oauth/SASLogon`,
        clientId: CLIENTID,       // <-- replace with your client ID
        redirectUri: `http://localhost:${PORT}/callback`,
        scopes: "openid profile",
        localPort: PORT,
    };

    main().catch((err) => {
      console.error("Unexpected error:", err);
      process.exit(1);
    });

    // ─────────────────────────────────────────────────────────────────────────────

    // Generate a cryptographically random code verifier (43–128 chars, base64url)
    function generateCodeVerifier() {
        return crypto.randomBytes(64).toString("base64url");
    }

    // Derive the code challenge: BASE64URL(SHA-256(verifier))
    function generateCodeChallenge(verifier) {
        return crypto.createHash("sha256").update(verifier).digest("base64url");
    }

    // Build the SASLogon authorization URL
    function buildAuthUrl(codeChallenge, state) {
        const params = new URLSearchParams({
            response_type: "code",
            client_id: CONFIG.clientId,
            redirect_uri: CONFIG.redirectUri,
            scope: CONFIG.scopes,
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });
        return `${CONFIG.authBaseUrl}/authorize?${params}`;
    }

    // Exchange the authorization code for tokens
    function exchangeCodeForTokens(code, codeVerifier) {
        return new Promise((resolve, reject) => {
            const body = new URLSearchParams({
                grant_type: "authorization_code",
                client_id: CONFIG.clientId,
                redirect_uri: CONFIG.redirectUri,
                code,
                code_verifier: codeVerifier,
            }).toString();

            const tokenUrl = new URL(`${CONFIG.authBaseUrl}/token`);

            const options = {
                hostname: tokenUrl.hostname,
                port: tokenUrl.port || 443,
                path: tokenUrl.pathname,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(body),
                },
                // Remove the line below if your Viya instance has a valid TLS cert
                rejectUnauthorized: false,
            };

            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode >= 400) {
                            reject(new Error(`Token error (${res.statusCode}): ${data}`));
                        } else {
                            resolve(parsed);
                        }
                    } catch {
                        reject(new Error(`Failed to parse token response: ${data}`));
                    }
                });
            });

            req.on("error", reject);
            req.write(body);
            req.end();
        });
    }

    // Wait for the browser redirect and extract code + state
    function waitForCallback(expectedState) {
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => {
                const parsed = url.parse(req.url, true);

                if (parsed.pathname !== "/callback") {
                    res.writeHead(404);
                    res.end("Not found");
                    return;
                }

                const { code, state, error, error_description } = parsed.query;

                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`
        <html><body>
          <h2>${error ? "Authorization failed" : "Authorization successful!"}</h2>
          <p>You may close this tab.</p>
        </body></html>
      `);

                server.close();

                if (error) {
                    reject(new Error(`OAuth error: ${error} — ${error_description}`));
                    return;
                }
                if (state !== expectedState) {
                    reject(new Error("State mismatch — possible CSRF attack"));
                    return;
                }

                resolve(code);
            });

            server.listen(CONFIG.localPort, () => {
                console.error(`Listening on http://localhost:${CONFIG.localPort}/callback`);
            });

            server.on("error", reject);
        });
    }

    // Main flow
    async function main() {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const state = crypto.randomBytes(16).toString("hex");

        const authUrl = buildAuthUrl(codeChallenge, state);

        console.error("\nOpen this URL in your browser to log in:\n");
        console.error(authUrl);
        console.error();

        // Try to auto-open in the default browser (best-effort)
        try {
            const { exec } = require("child_process");
            const cmd =
                process.platform === "win32"
                    ? `start "" "${authUrl}"`
                    : process.platform === "darwin"
                        ? `open "${authUrl}"`
                        : `xdg-open "${authUrl}"`;
            exec(cmd);
        } catch {
            // ignore — user can open manually
        }

        let code;
        try {
            code = await waitForCallback(state);
        } catch (err) {
            console.error("Callback error:", err.message);
            return null;
        }

        console.error("Authorization code received. Exchanging for tokens...");

        let tokens;
        try {
            tokens = await exchangeCodeForTokens(code, codeVerifier);
        } catch (err) {
            console.error("Token exchange error:", err.message);
            return null;
        }

        console.error("\nTokens received:");
        console.error("  access_token :", tokens.access_token?.slice(0, 40) + "...");
        console.error("  token_type   :", tokens.token_type);
        console.error("  expires_in   :", tokens.expires_in, "seconds");
        if (tokens.refresh_token) {
            console.error("  refresh_token:", tokens.refresh_token.slice(0, 20) + "...");
        }
        if (tokens.id_token) {
            console.error("  id_token     :", tokens.id_token.slice(0, 40) + "...");
        }

        // tokens.access_token is ready to use as a Bearer token for Viya REST APIs
        return tokens.access_token
    }


  
