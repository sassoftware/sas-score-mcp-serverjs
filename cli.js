#!/usr/bin/env node
/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Main entry point for MCP server


import coreSSE from './src/coreSSE.js';
import expressMcpServer from './src/expressMcpServer.js';
import createMcpServer from './src/createMcpServer.js';
// import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import { randomUUID } from 'node:crypto';

import readCerts from './src/toolHelpers/readCerts.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import setupSkills from './src/setupSkills.js';
import { parseArgs } from "node:util";

import NodeCache from 'node-cache';
//import { be } from 'zod/locales';
//import { auth } from '@modelcontextprotocol/sdk/client/auth';
//import getOpts from './src/toolHelpers/getOpts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pkg = fs.readFileSync(__dirname + '/package.json', 'utf8');

// Parse command line arguments
const args = parseArgs({
  options: {
    port: {
      type: 'string',
      short: 'p',
      description: 'Port to run the server on'
    },
    mcptype: {
      type: 'string',
      short: 'm',
      description: 'MCP server type (http or stdio)'
    },
    https: {
      type: 'boolean',
      description: 'Use HTTPS for the server (default: FALSE)'
    },

    viya: {
      type: 'string',
      short: 'v',
      description: 'Viya server URL'
    },
    mcphost: {
      type: 'string',
      short: 'm',
      description: 'MCP server host (default: http://localhost:8080)'
    },
    authflow: {
      type: 'string',
      short: 'a',
      description: 'Authentication flow (sascli, code, token, oauth, oauth,oauthclient)'
    },
    clientid: {
      type: 'string',
      short: 'c',
      description: 'Client ID for authentication'
    },
    profile: {
      type: 'string',
      description: 'SAS CLI profile name'
    },
    config: {
      type: 'string',
      description: 'SAS CLI config directory'
    },
    casserver: {
      type: 'string',
      description: 'CAS server name (default: cas-shared-default)'
    },
    computecontext: {
      type: 'string',
      description: 'Compute session name or context (default: SAS Job Execution compute context)'
    },
    env: {
      type: 'string',
      short: 'e',
      description: 'Environment file path (default: .env in current working directory)'
    },
    agent: {
      type: 'boolean',
      description: 'Enable agent mode with a pre-configured set of skills based on the client specified (default: false)'
    },
    client: {
      type: 'string',
      alias: 'mcpclient',
      description: 'MCP client name (github, claude...). Defaults to \'github\''
    },
    folder: {
      type: 'string',
      short: 'f',
      description: 'Subfolder under the client folder to copy the skills to, used to have different set of skills for different agents under the same client'

    },
    skills: {
      type: 'string',
      short: 's',
      description: 'Copies the skills for .github and .claude to the user home directory under .clientname (e.g. .github) or current directory if client name starts with dot (e.g. ./.github), used to have different set of skills for different clients'
    },
    help: {
      type: 'boolean',
      short: 'h',
      description: 'Show help message'
    },
    version: {
      type: 'boolean',
      description: 'Show version'
    },

  },
  strict: false,
  allowPositionals: false
});

// Handle help flag
if (args.values.help) {
  console.error(`
                sas-score-mcp-serverjs - Version: ${JSON.parse(pkg).version}

Usage: npx @sassoftware/sas-score-mcp-serverjs@dev [options]

Options:
  Minimal options:
    -v, --viya <url>               Viya server URL
  
  MCP server options:
    -t, --mcptype <type>           MCP server type: http or stdio (default: http)
    -m, --mcphost <host>           MCP server host - can be remote URL - (default: http://localhost:8080)
    --agent                 Enable agent mode (default: false) with a pre-configured set of skills based on the client specified
  
  Authentication options:
    -c, --clientid <id>            Client ID for oauth authentication(pkce preferred. default: vscodemcp)
    -a, --authflow <flow>          Authentication flow: oauth, oauthclient, sascli, code, token(default oauth)
    --profile <name>               SAS CLI profile name for sascli flow (default: Default)
    --config <path>                SAS CLI config directory for sascli flow (default: user home directory)

  Agent/skills options:
    -s, --skills  <name>           Copies the skills for .github and .claude
    -f, --folder <folder>          Subfolder to copy the skills to. ex: ./github/<folder>, used to have different set of skills for different agents under the same client. 
 
  Other options:
    -p, --port <port>              Port to run the server on (default: 8080)
    --https                        Use HTTPS for the server (default: false)
    --casserver <name>             CAS server name (default: cas-shared-default)
    --computecontext <name>        Compute session name or context (default: SAS Job Execution compute context) 

    -e, --envfile <path>           Environment file path
    -h, --help                     Show this help message
    --version                      Show version
  

Environment Variables:
  Use .env file or set environment variables for configuration.
  A alternative to cmd line arguments, and in some cases required for sensitive information like client secrets.
  See README.md for more information.
  `);
  process.exit(0);
}
if (args.values.skills) {
  console.error(`[Note] Settings up skills for ${args.values.skills }`);
  setupSkills(args.values.skills, args.values.folder);;
  console.error(`[Note] Skills setup completed. `);
  process.exit(0);
}

console.error('Parsed command line arguments:', args.values);
// read env file and then override with command line arguments
if (args.values.env) {
  console.error('Working Directory', process.cwd());
  let envf = process.cwd() + '\\' + args.values.env;
  //__dirname + '\\.env';
  console.error('Env file:', envf);
  if (fs.existsSync(envf)) {
    console.error(`Loading environment variables from ${envf}...`);
    let e = iconfig(envf); // avoid dotenv since it writes to console.error
    console.error('[Note]: Environment variables loaded from .env file...');
    console.error('Loaded env variables:', e);
    // dotenvExpand.expand(e);
  } else {
    console.error(
      '[Note]: No env file found, Using default environment variables...'
    );
  }
}
// Apply command line arguments to override environment variables

process.env.PORT = process.env.PORT || '8080';
process.env.HTTPS = args.values.https ? 'TRUE' : (process.env.HTTPS === 'TRUE' ? 'TRUE' : 'FALSE');
process.env.MCPTYPE = args.values.mcptype || process.env.MCPTYPE || 'http';
process.env.MCPHOST = args.values.mcphost || process.env.MCPHOST || 'http://localhost:8080';
process.env.AUTHFLOW = args.values.authflow || process.env.AUTHFLOW || 'oauth';
process.env.MCPCLIENT = args.values.client || process.env.MCPCLIENT || 'github';
process.env.VIYA_SERVER = args.values.viya || process.env.VIYA_SERVER;
process.env.CLIENTID = args.values.clientid || process.env.CLIENTID || 'vscodemcp';
process.env.CLIENTSECRET = null;
process.env.SAS_CLI_PROFILE = args.values.profile || process.env.SAS_CLI_PROFILE || 'Default';
process.env.SAS_CLI_CONFIG = args.values.config || process.env.SAS_CLI_CONFIG || os.homedir(); // default to user home directory
process.env.CASSERVER = args.values.casserver || process.env.CASSERVER || 'cas-shared-default';
process.env.COMPUTECONTEXT = args.values.computecontext || process.env.COMPUTECONTEXT || 'SAS Job Execution compute context';
process.env.APPHOST = 'localhost';
process.env.AGENT = args.values.agent ? 'TRUE' : process.env.AGENT;
process.env.CLIENT = args.values.client || process.env.CLIENT || 'github';

process.env.SAMESITE = 'Lax,secure';
process.env.APPHOST = '0.0.0.0';
process.env.APPNAME = 'sas-score-mcp-serverjs';

// Handle version flag
if (args.values.version) {
  let pkgJson = JSON.parse(pkg);
  console.error(pkgJson.version);
  process.exit(0);
}

// copy the skills to  directory based on the client name, so that different MCP clients can have different sets of skills if needed
// the -client indicates the current mcp client 
console.error(`[Note] MCP client set to: ${process.env.CLIENT}`);



/********************************* */
const BRAND = 'sas-score'
/********************************* */
let pkgJson = JSON.parse(pkg);
let version = pkgJson.version;
let mcpType = process.env.MCPTYPE || 'http';
console.error(
  `\nStarting MCP ServerJS - Version: ${pkgJson.version} - ${new Date().toISOString()}\n
     brand: ${process.env.BRAND || BRAND}
     mcpType: ${mcpType}
     viyaServer: ${process.env.VIYA_SERVER}`
);
// session sessionCache
// For more robust caching consider products like Redis
// and storage provided by cloud providers

debugger;
let sessionCache = new NodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 2 * 60, useClones: false });

//
// Load environment variables from .env file if present
// swithching to:
// stdio: set the env in the mcp config
// http: use dotenv-cli to load env before starting the mcp server

// setup base appEnv 
// for stdio this is the _appContext
// for http each session a copy of this as appEnvTemplate is created in corehttp

let https = process.env.HTTPS != null ? process.env.HTTPS.toUpperCase() : "FALSE";
let authExternal = false;
let authFlow = process.env.AUTHFLOW;
let mcpHost = process.env.MCPHOST;

if (authFlow === 'oauth' || authFlow === 'oauthclient') {
  authFlow = 'bearer';
  authExternal = (authFlow === 'oauthclient') ? true : false;
} else if (authFlow === 'bearer') {
  authExternal = true; // in bearer token flow we assume the token is generated externally and passed in via env variable or token file, so we set authExternal to true to indicate that  
}
  let autoLogon = process.env.AUTOLOGON != null ? process.env.AUTOLOGON.toUpperCase() : "FALSE";
const appEnvBase = {
  version: version,
  mcpType: mcpType,
  mcpClient: process.env.MCPCLIENT || 'github',
  agent: (process.env.AGENT === 'TRUE') ? true : false,
  mcpHost: (process.env.MCPHOST == null) ? 'http://localhost:8080' : process.env.MCPHOST,
  brand: (process.env.BRAND == null) ? BRAND : process.env.BRAND,
  HTTPS: https,
  SAS_CLI_PROFILE: process.env.SAS_CLI_PROFILE || 'Default',
  SAS_CLI_CONFIG: process.env.SAS_CLI_CONFIG || os.homedir(), // default to user home directory
  SSLCERT: process.env.SSLCERT || null,
  VIYACERT: process.env.VIYACERT || null,

  AUTHFLOW: authFlow,
  AUTHEXTERNAL: authExternal,
  BEARERTOKEN: null,
  AUTOLOGON: autoLogon,
  VIYA_SERVER: process.env.VIYA_SERVER,
  PORT: process.env.PORT || 8080,
  USERNAME: process.env.USERNAME || null,
  PASSWORD: process.env.PASSWORD || null,
  CLIENTID: process.env.CLIENTID || null,
  CLIENTSECRET: process.env.CLIENTSECRET || null,
  PKCE: process.env.PKCE || null,

  TOKEN: process.env.TOKEN || null,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN || null,
  TOKENFILE: process.env.TOKENFILE || null,
  TLS_CREATE: process.env.TLS_CREATE || null,
  CASSERVER: process.env.CASSERVER,
  COMPUTECONTEXT: process.env.COMPUTECONTEXT,

  // command line arguments
  cliArgs: args.values,
  // user defined tools
  //runtime variables
  tokenRefresh: process.env.TOKENREFRESH === 'FALSE' ? false : true,
  tls: null,
  refreshToken: null,
  transports: {},
  mcpServer: null,
  viyaSessions: {},
  store: null,
  casServer: null,
  casSessionId: null,
  computeSessionId: null,
  logonPayload: null,
  bearerToken: null,
  tlsOpts: null,
  oauthInfo: null,
  contexts: {
    AUTHFLOW: authFlow,
    AUTHEXTERNAL: authExternal,
    host: process.env.VIYA_SERVER,
    APPHOST: process.env.APPHOST || 'localhost',
    APPNAME: process.env.APPNAME || 'sas-score-mcp-serverjs',
    PORT: process.env.PORT || 8080,
    HTTPS: https,
    store: null, /* for restaf users */
    storeConfig: {},
    oauthInfo: null,
    CLIENTID: process.env.CLIENTID || null,
    CLIENTSECRET: process.env.CLIENTSECRET || null,
    pkce: process.env.PKCE || null,
    casSession: null, /* restaf cas session object */
    computeSession: null, /* restaf compute session object */
    viyaCert: null, /* ssl/tsl certificates to connect to viya */
    appCert: null,
    logonPayload: null, /* viya logon payload  to connect to viya */
    casServerId: null,
    computeSessonId: null,
    sas: (process.env.COMPUTECONTEXT == null) ? 'SAS Job Execution compute context' : process.env.COMPUTECONTEXT,
    cas: (process.env.CASSERVER == null) ? 'cas-shared-default' : process.env.CASSERVER,
    ext: {} /* for additional extensions that a developer may want to add */
  }
};

process.env.APPPORT = appEnvBase.PORT;
let useHapi = process.env.USEHAPI === 'TRUE' ? true : false;
appEnvBase.useHapi = useHapi;

// setup TLS options for viya calls
appEnvBase.contexts.viyaCert = readCerts(appEnvBase.VIYACERT); /* appEnvBase.contexts.viyaCert is set here */

// setup TLS options for app server (expressMcpServer or hapiMcpServer)
appEnvBase.tlsOpts = readCerts(appEnvBase.SSLCERT);
appEnvBase.contexts.appCert = appEnvBase.tlsOpts; /* just for completeness */

appEnvBase.contexts.storeConfig = {
  casProxy: true,
  options: { ns: null, proxyServer: null, httpOptions: appEnvBase.contexts.viyaCert }
};

if (appEnvBase.TOKENFILE != null) {
  try {
    console.error(`[Note]Loading token from file: ${appEnvBase.TOKENFILE}...`);
    appEnvBase.TOKEN = fs.readFileSync(appEnvBase.TOKENFILE, { encoding: 'utf8' });
    appEnvBase.AUTHFLOW = 'token';
    appEnvBase.contexts.logonPayload = {
      host: appEnvBase.VIYA_SERVER,
      authType: 'server',
      token: appEnvBase.TOKEN,
      tokenType: 'Bearer'

    }
  } catch (err) {
    console.error(`[Error] Failed to read token file: ${err}`);
  }
}


// setup mcpServer (both http and stdio use this)
// this is singleton - best practices recommend this

// setup skills based on client before mcp initialization
//



if (process.env.AGENT === 'TRUE') {
  if (process.env.CLIENT !== 'none') {
    console.error(`[Note] Setting up skills for client: ${process.env.CLIENT}...`);
    setupSkills(process.env.CLIENT, args.values.folder); 
  } 
} else {
    console.error(`[Note] Agent mode not enabled`);
  }
let mcpServer = await createMcpServer(sessionCache, appEnvBase);

sessionCache.set('appEnvBase', appEnvBase);
let appEnvTemplate = Object.assign({}, appEnvBase);

sessionCache.set('appEnvTemplate', appEnvTemplate);

// prime transport cache
let transports = {
  "dummy": null
};
sessionCache.set('transports', transports);
let tokenlist = {
  dummy: null
}
sessionCache.set('tokenlist', tokenlist);

// set this for stdio transport use
// dummy sessionId for use in the tools  

// creat a dummy sessionId for stdio since there is only one session and transport in that case, and tools need a sessionId to access the appEnvBase and contexts
let sessionId = randomUUID();
sessionCache.set(sessionId, appEnvBase);
sessionCache.set('currentId', sessionId);

console.error('===================================================================');
console.error(`MCP ServerJS - Version: ${pkgJson.version} - ${new Date().toISOString()}`);
console.error(`
Usage: sas-score-mcp-serverjs [options]

Options:
  Minimal options:
    VIYA_SERVER                   ${appEnvBase.VIYA_SERVER}
    CLIENTID                      ${appEnvBase.CLIENTID}

  MCP server options:
    MCPTYPE                       ${appEnvBase.mcpType}
    MCPHOST                       ${appEnvBase.mcpHost}
    PORT                          ${appEnvBase.PORT}
    HTTPS                         ${appEnvBase.contexts.HTTPS}
    CLIENT                        ${appEnvBase.mcpClient}
    AGENT                         ${appEnvBase.agent}

  Authentication options:
    AUTHFLOW                      ${process.env.AUTHFLOW}  
    CLIENTSECRET                  ${appEnvBase.CLIENTSECRET}
    PROFILE                       ${appEnvBase.SAS_CLI_PROFILE} 
    CONFIG                        ${appEnvBase.SAS_CLI_CONFIG} 

  Other options:
    CASSERVER                     ${appEnvBase.CASSERVER} 
    COMPUTECONTEXT                ${appEnvBase.COMPUTECONTEXT}
    }

`);

console.error('===================================================================');
if (process.env.AGENT === 'TRUE') {
  console.error(`
    [Note] The SAS Viya Scoring Expert agent has been installed successfully.
      Depending on the client you are using, the agent might not be active
      If the agent does not appear in the agent dropdown list your options are:
        - use the /subagent command
        - exit this app and issue the npx command to restart the server
        `);
}
if (mcpType === 'stdio') {
  console.error('[Note] Setting up stdio transport with sessionId:', sessionId);
  console.error('[Note] Used in setting up tools and some persistence(not all).');
  await coreSSE(mcpServer);

} else {
  console.error('[Note] Starting HTTP MCP server...');
  await expressMcpServer(mcpServer, sessionCache, appEnvBase);
  console.error('[Note] MCP HTTP express server started on port ' + appEnvBase.PORT);
}

// custom reader for .env file to avoid dotenv logging to console
function iconfig(envFile) {
  try {
    let data = fs.readFileSync(envFile, 'utf8');
    let d = data.split(/\r?\n/);
    let envData = {};
    d.forEach(l => {
      if (l.length > 0 && l.indexOf('#') === -1) {
        let la = l.split('=');
        let envName = la[0];
        if (la.length === 2 && la[1].length > 0) {
          let t = la[1].trim();
          process.env[envName] = t;
          envData[envName] = t;
        }
      }
    });
    return envData;
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
}

