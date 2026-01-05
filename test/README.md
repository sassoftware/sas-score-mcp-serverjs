# MCP API Tests

This directory contains tests that use direct HTTP calls to test the MCP protocol and tools.

## Running Tests

### List Libraries Test

Test the `list-libraries` tool using raw HTTP POST requests to the MCP endpoint:

**Prerequisites:**
1. Start the MCP server in HTTP mode:
```bash
npm start
# Server should be running at http://localhost:8080/mcp
```

2. In a separate terminal, run the test:
```bash
node test/listLibraries.test.js
```

This test will:
1. Make HTTP POST requests to http://localhost:8080/mcp
2. Use JSON-RPC 2.0 protocol format
3. Call the `list-libraries` tool with various parameters
4. Verify the responses

### Test Scenarios

The test covers:
- ✓ Connecting to MCP server
- ✓ Listing available tools
- ✓ List CAS libraries with default parameters
- ✓ List CAS libraries with custom limit
- ✓ List SAS libraries
- ✓ List libraries with pagination
- ✓ Server parameter normalization (CAS → cas)

## Prerequisites

Make sure you have:
- Node.js >= 22.16.0
- Valid `.env` file with SAS Viya credentials
- `@modelcontextprotocol/sdk` installed

## Environment Setup

The test requires environment variables for SAS Viya connection:
```
VIYA_SERVER=https://your-viya-server.com
CLIENTID=your-client-id
CLIENTSECRET=your-client-secret
```

## Output

The test will display:
- Connection status
- Tool discovery results
- Each test scenario with pass/fail status
- Response data from each call
- Final summary of passed/failed tests
