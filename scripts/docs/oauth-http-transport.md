
# Notes support for oauth in http transport 

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

### pkce clientid when mcp server does teh oauth flow

```js

{
  scope: [ 'openid' ],
  client_id: 'pkcevscodelocal',
  resource_ids: [ 'none' ],
  authorized_grant_types: [ 'authorization_code', 'refresh_token' ],
  redirect_uri: [
    'http://localhost:8080/callback',
    'https://localhost:8080/callback'
  ],
  autoapprove: [ 'true' ],
  access_token_validity: 7776000,
  authorities: [ 'uaa.none' ],
  allowpublic: true,
  lastModified: 1776355837531,
  required_user_groups: []
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