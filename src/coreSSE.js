
/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import makeServerFactory from "./createMcpServer.js";

async function coreSSE(appEnvBase) {
  // legacy: 'reject' — pure 2026-07-28 MCP revision, no 2025-era stdio opening.
  const handle = serveStdio(makeServerFactory(appEnvBase), { legacy: "reject" });
  console.error("[Note] MCP Server serving over stdio.");
  return handle;
}
export default coreSSE;
