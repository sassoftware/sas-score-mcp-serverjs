#!/usr/bin/env node
/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Main entry point for MCP server


import coreSSE from './src/coreSSE.js';
import expressMcpServer from './src/expressMcpServer.js';
import hapiMcpServer from './src/hapiMcpServer.js';

import createMcpServer from './src/createMcpServer.js';
// import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import { randomUUID } from 'node:crypto';

import refreshToken from './src/toolHelpers/refreshToken.js';
import getOptsViya from './src/toolHelpers/getOptsViya.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import NodeCache from 'node-cache';
import getOpts from './src/toolHelpers/getOpts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pkg = fs.readFileSync(__dirname + '/package.json', 'utf8');

if (process.env.ENVFILE === 'FALSE') {
  //use this when using remote mcp server and no .env file is desired
  console.error('[Note]: Skipping .env file as ENVFILE is set to FALSE...');
} else {
  console.error('Working Directory', process.cwd());
  let envf = process.cwd() + '\\.env'; 
  //__dirname + '\\.env';
  console.error('Env file:', envf); 
  if (fs.existsSync(envf)) {
    console.error(`Loading environment variables rom ${envf}...`);
    let e = iconfig(envf); // avoid dotenv since it writes to console.log
    console.error('[Note]: Environment variables loaded from .env file...');
    console.error('Loaded env variables:', e);
    // dotenvExpand.expand(e);
  } else {
    console.error(
      '[Note]: No .env file found, Using default environment variables...'
    );
  }
}

if (process.env.APPHOST == null) {
  process.env.APPHOST = 'localhost';
} 
/********************************* */
const BRAND = 'sas-score'
/********************************* */
let pkgJson = JSON.parse(pkg);
let version = pkgJson.version;
let mcpType = process.env.MCPTYPE || 'http';
console.error(
  `\nStarting MCP ServerJS - Version: ${pkgJson.version} - ${new Date().toISOString()}\n
     brand: ${process.env.BRAND || BRAND}\n
     mcpType: ${mcpType}\n
     viyaServer: ${process.env.VIYA_SERVER}\n`
);
// session sessionCache
// For more robust caching consider products like Redis
// and storage provided by cloud providers
console.error(process.env.COMPUTECONTEXT);
debugger;
let sessionCache = new NodeCache({ stdTTL: 0, checkperiod: 2 * 60, useClones: false });

//
// Load environment variables from .env file if present
// swithching to:
// stdio: set the env in the mcp config
// http: use dotenv-cli to load env before starting the mcp server


// need to tell core what transport to use(http or stdio)

//  subclasses for sasQuery tool (special use case)
// to be replaced by the planned adding external tool definition capability

let subclassJson = [];
if (process.env.SUBCLASS != null) {
  console.error(`Using subclass: ${process.env.SUBCLASS}`);
  let subclass = process.env.SUBCLASS;
  if (fs.existsSync(subclass)) {
    console.error(`Loading subclass information from ${subclass}...`);
    let s = fs.readFileSync(subclass, 'utf8');
    subclassJson = JSON.parse(s);
    console.error(`Loaded subclass: ${JSON.stringify(subclassJson, null, 2)}`);
  }
}
// setup base appEnv 
// for stdio this is the _appContext
// for http each session a copy of this as appEnvTemplate is created in corehttp

// backward compability variables
let clientID = process.env.CLIENTID || process.env.CLIENTIDPW || null;
let clientSecret = process.env.CLIENTSECRET || process.env.CLIENTSECRETPW || null;
let https = process.env.HTTPS != null ? process.env.HTTPS.toUpperCase() : "FALSE";
const appEnvBase = {
  version: version,
  mcpType: mcpType, 
  brand: (process.env.BRAND == null) ? BRAND : process.env.BRAND,
  HTTPS: https,
  SAS_CLI_PROFILE: process.env.SAS_CLI_PROFILE || 'Default',
  SAS_CLI_CONFIG: process.env.SAS_CLI_CONFIG || process.env.HOME, // default to user home directory
  SSLCERT: process.env.SSLCERT || null,
  VIYACERT: process.env.VIYACERT || null,

  AUTHFLOW: process.env.AUTHFLOW || 'sascli',
  VIYA_SERVER: process.env.VIYA_SERVER,
  PORT: process.env.PORT || 8080,
  USERNAME: process.env.USERNAME || null,
  PASSWORD: process.env.PASSWORD || null,
  CLIENTID: clientID,
  CLIENTSECRET: clientSecret,
  PKCE: process.env.PKCE || null,

  TOKEN: process.env.TOKEN || null,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN || null,
  TOKENFILE: process.env.TOKENFILE || null,
  TLS_CREATE: process.env.TLS_CREATE || null,
  SUBCLASS: process.env.SUBCLASS || null,
  subclassJson: subclassJson,
  // future use for controlling tool list using env variable
  toolsets:
    process.env.TOOLSETS != null
      ? process.env.TOOLSETS.split(',')
      : ['default'],
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
    AUTHFLOW: process.env.AUTHFLOW || 'sascli',
    host: process.env.VIYA_SERVER,
    APPHOST: process.env.APPHOST || 'localhost',
    APPNAME: process.env.APPNAME || 'sas-score-mcp-serverjs',
    PORT: process.env.PORT || 8080,
    HTTPS: https,
    store: null, /* for restaf users */
    storeConfig: {},
    oauthInfo: null,
    CLIENTID: clientID,
    CLIENTSECRET: clientSecret,
    pkce: process.env.PKCE || null,
    casSession: null, /* restaf cas session object */
    computeSession: null, /* restaf compute session object */
    viyaCert: null, /* ssl/tsl certificates to connect to viya */
    logonPayload: null, /* viya logon payload  to connect to viya */
    casServerId: null,
    computeSessonId: null,
    sas: (process.env.COMPUTECONTEXT == null) ? 'SAS Job Execution compute context' : process.env.COMPUTECONTEXT,
    cas: (process.env.CASSERVER == null) ? 'cas-shared-default' : process.env.CASSERVER,
    ext: {} /* for additional extensions that a developer may want to add */
  }
};

process.env.APPPORT=appEnvBase.PORT;

// setup TLS options for viya calls

console.error('[Note]Viya SSL dir set to: ' + appEnvBase.VIYACERT);
await getOptsViya(appEnvBase); /* appEnvBase.contexts.viyaCert is set here */
appEnvBase.tlsOpts = getOpts(appEnvBase);
appEnvBase.contexts.storeConfig = {
  casProxy: true,
  options: { ns: null, proxyServer: null, httpOptions: appEnvBase.contexts.viyaCert }
};

if (appEnvBase.TOKENFILE != null) {
  try {
    console.error(`[Note]Loading token from file: ${appEnvBase.TOKENFILE}...`);
    appEnvBase.TOKEN = fs.readFileSync(appEnvBase.TOKENFILE, { encoding: 'utf8' });
    appEnvBase.AUTHFLOW = 'token';
    appEnvBase.appContexts.logonPayload = {
      host: appEnvBase.VIYA_SERVER,
      authType: 'server',
      token: appEnvBase.TOKEN,
      tokenType: 'Bearer'

    }
  } catch (err) {
    console.error(`[Error] Failed to read token file: ${err}`);
  }
}

// handle refresh token flow 
// use this for testing only. 
if (appEnvBase.REFRESH_TOKEN != null) {
  appEnvBase.refreshToken = appEnvBase.REFRESH_TOKEN;
  appEnvBase.AUTHFLOW = 'refresh';
  let t = await refreshToken(appEnvBase, { token: appEnvBase.REFRESH_TOKEN, host: appEnvBase.VIYA_SERVER });
  appEnvBase.contexts.logonPayload = {
    host: appEnvBase.VIYA_SERVER,
    authType: 'server',
    token: t,
    tokenType: 'Bearer'
  }
}

// if authflow is cli or code, postpone getting logonPayload until needed


// setup mcpServer (both http and stdio use this)
// this is singleton - best practices recommend this

let mcpServer = await createMcpServer(sessionCache, appEnvBase);

sessionCache.set('appEnvBase', appEnvBase);
let appEnvTemplate = Object.assign({}, appEnvBase);

sessionCache.set('appEnvTemplate', appEnvTemplate);

let transports = {};
sessionCache.set('transports', transports);

// set this for stdio transport use
// dummy sessionId for use in the tools  
let useHapi = process.env.AUTHFLOW === 'code' ? true : false;
if (mcpType === 'stdio') {
  let sessionId = randomUUID();
  sessionCache.set('currentId', sessionId);
  sessionCache.set(sessionId, appEnvBase);
  console.error('[Note] Setting up stdio transport with sessionId:', sessionId);
  console.error('[Note] Used in setting up tools and some persistence(not all).');
  await coreSSE(mcpServer);

} else {
  console.error('[Note] Starting HTTP MCP server...');
  if (useHapi === true) {
    await hapiMcpServer(mcpServer, sessionCache, appEnvBase);
    console.error('[Note] Using HAPI HTTP server...')
  } else {
    await expressMcpServer(mcpServer, sessionCache, appEnvBase);
    console.error('[Note] MCP HTTP server started on port ' + appEnvBase.PORT);
  }
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
    console.log(err);
    process.exit(0);
  }
}

