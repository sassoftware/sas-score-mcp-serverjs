# Configuring a Localhost MCP Server for Claude

This guide covers how to connect Claude to a locally running MCP server (e.g., `http://localhost:8080/mcp`) for both Claude Desktop (Chat) and Claude Code (CLI/IDE).

---

## Quick Comparison

| Feature | Claude Desktop (Chat) | Claude Code (CLI/IDE) |
|---|---|---|
| Config file | `claude_desktop_config.json` | `.claude/settings.json` |
| HTTP MCP support | Limited | Full |
| OAuth2 on localhost | Not supported via config | Supported |
| stdio MCP support | Yes | Yes |
| Auth via headers | Not in config file | Via `auth` object |

---

## Claude Desktop (Chat)

Claude Desktop reads from:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### What is supported

Claude Desktop reliably supports **stdio-based MCP servers** (local processes). HTTP with OAuth2 on localhost is **not supported** via the config file.

### Option 1 — stdio (recommended for local servers)

Wrap your server as a stdio process (or use a stdio-compatible launcher):

```json
{
    "mcpServers": {
        "sasmcp": {
            "command": "node",
            "args": ["C:/path/to/your/mcp-server.js"],
            "env": {
                "API_KEY": "your-key"
            }
        }
    }
}
```

### Option 2 — HTTP via `mcp-remote` bridge

[`mcp-remote`](https://github.com/geelen/mcp-remote) translates HTTP/SSE → stdio so Claude Desktop can connect to a local HTTP server without native OAuth2 support:

```json
{
    "mcpServers": {
        "sasmcp": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "http://localhost:8080/mcp"
            ]
        }
    }
}
```

### Option 3 — Remote HTTPS server with OAuth2 (via UI)

If you expose your local server via HTTPS tunnel (e.g., [ngrok](https://ngrok.com), Cloudflare Tunnel), you can add it in Claude Desktop via:

**Settings → Customize → Connectors → Add custom connector**

Claude Desktop will handle the OAuth2 flow through the UI. This cannot be done via `claude_desktop_config.json`.

### What does NOT work in `claude_desktop_config.json`

```json
// This will be skipped with "not valid MCP configuration" error:
{
    "mcpServers": {
        "sasmcp": {
            "type": "http",
            "url": "http://localhost:8080/mcp",
            "auth": { ... }        // <-- not supported
        }
    },
    "preferences": { ... }         // <-- not valid here either
}
```

---

## Claude Code (CLI / IDE Extension)

Claude Code reads from:
- **Project-level:** `.claude/settings.json` in your project root
- **Global:** `~/.claude/settings.json`

Project-level settings take precedence and are scoped to that workspace.

### Option 1 — HTTP with OAuth2 (full support)

Claude Code has native OAuth2 support for HTTP MCP servers running on localhost:

```json
{
    "mcpServers": {
        "sasmcp": {
            "type": "http",
            "url": "http://localhost:8080/mcp",
            "auth": {
                "type": "oauth2",
                "clientId": "vscodemcp",
                "authorizationUrl": "http://localhost:8080/oauth/authorize",
                "tokenUrl": "http://localhost:8080/oauth/token",
                "scope": "openid",
                "redirectUrl": "http://localhost:8080/oauth/callback",
                "metadata": "http://localhost:8080/.well-known/oauth-authorization-server"
            }
        }
    }
}
```

Claude Code will open the browser for the OAuth2 authorization flow on first use.

### Option 2 — HTTP with a static Bearer token

If your server accepts a static token instead of OAuth2:

```json
{
    "mcpServers": {
        "sasmcp": {
            "type": "http",
            "url": "http://localhost:8080/mcp",
            "headers": {
                "Authorization": "Bearer your-static-token"
            }
        }
    }
}
```

### Option 3 — stdio

stdio also works in Claude Code:

```json
{
    "mcpServers": {
        "sasmcp": {
            "command": "node",
            "args": ["C:/path/to/your/mcp-server.js"],
            "env": {
                "API_KEY": "your-key"
            }
        }
    }
}
```

### `preferences` block

The `preferences` block belongs in `.claude/settings.json` separately from the MCP server definition — do not mix them into the same object as `mcpServers`:

```json
{
    "mcpServers": { ... },
    "preferences": {
        "coworkWebSearchEnabled": true
    }
}
```

---

## Summary: Which approach to use?

| Scenario | Recommended approach |
|---|---|
| Local server, Claude Desktop, no auth | stdio in `claude_desktop_config.json` |
| Local server, Claude Desktop, OAuth2 | `mcp-remote` bridge via stdio |
| Local server, Claude Code, OAuth2 | HTTP + `auth` block in `.claude/settings.json` |
| Remote HTTPS, Claude Desktop, OAuth2 | Add via Desktop UI (Connectors) |
| Remote HTTPS, Claude Code, OAuth2 | HTTP + `auth` block in `.claude/settings.json` |
