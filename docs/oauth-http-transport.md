
# Notes support for oauth in http transport 

> The mcp server never brokers an OAuth login itself (there is no
> `/oauth/authorize`, `/callback`, or `/oauth/token` on this server) — the MCP
> client performs its own OAuth2/PKCE flow against SAS Logon and sends the
> resulting token as a bearer token on every request. `AUTHFLOW=bearer` (also
> accepted as `oauth`/`oauthclient`) is the only OAuth-shaped auth mode. The
> server also speaks only the 2026-07-28 MCP protocol revision — there is no
> backward compatibility with earlier (2025-era) clients.

## Claude

TBD

## VSCODE Githu Copilot

### Scenario:

MCP server running on localhost or remote(Azure Container App as an example)

### Environment variables

This additional variable needs to be specified.
#### MCPHOST:

- localhost:  MCPHOST=https://localhost:8080
- remote: MCPHOST=https:someremote-mcp-server


### pkce clientid(client does the oauth flow)
It appears that the / at the end of the redirect URI is important]
```js
{
  client_id: 'pkcevscode',
  scope: [ 'openid' ],
  resource_ids: [ 'none' ],
  autoapprove: true,
  authorized_grant_types: [ 'authorization_code' ],
  access_token_validity: 86400,
  allowpublic: true,
  redirect_uri: [ 'http://127.0.0.1:33418/' ]
}
```

### Define the MCP server with this config

```js
"sasmcpx": {
      "type": "http",
      "url": "<MCPHOST value>/mcp",
      "oauth": {
        "type": "oauth2",
        "clientId": "pkcevscode"
      }
    }
```

### '/.well-known/oauth-protected-resource' json

```js
    let payload = {
      resource: 'https://localhost:8080/mcp',
      authorization_servers: [`viya-server-url`],
      scopes_supported: ['openid'],
      bearer_methods_supported: ["header"]
    }
```

### ./well-known/oauth-authorization_servers

```js
let VIYA_SERVER=<viya-url>
{
  issuer: `${VIYA_SERVER}`,
  authorization_endpoint: `${VIYA_SERVER}/SASLogon/oauth/authorize`,
  token_endpoint: `${VIYA_SERVER}/SASLogon/oauth/token`,
  response_types_supported: [ 'code' ],
  grant_types_supported: [ 'authorization_code', 'refresh_token' ],
  code_challenge_methods_supported: [ 'S256' ],
  scopes_supported: [ 'openid' ]
}
```