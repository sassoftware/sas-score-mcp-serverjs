# sas-score-mcp-serverjs
A Model Context Protocol (MCP) Server for Scoring with SAS Viya

## Overview
This MCP server is designed for scoring with SAS Viya.

> Note: **scoring** refers to executing any code that takes some input and returns results.

Some examples are:

- models created with SAS solutions like Model Studio, Intelligent Decisioning etc...
- user written SAS program
  - SAS Studio Flow
  - job Definitions
  - jobs using SAS Studio or other interfaces

## Target Audience
This MCP server was developed for two types of SAS users.

### SAS users
SAS users who want to use natural language("chat") to execute prebuilt SAS code and models.
See this [quick reference](sas-mcp-tools-reference.md) for details.

### MCP tool developers 
SAS developers who want to extend the capabilities of the server with their own tools. See the [guide](tool-developer-guide.md) for details.

## Configuration Variables
Typically these are set either in the .env file or as environment variables (or both). This is full list of the configuration variables used the mcp server.

```env

# Indicate what type of transport(stdio|http)
# http is useful for remote mcp servers
# If running locally, recommend stdio

MCPTYPE=http

# Port for http transport(default is 8080)

PORT=8080

# If transport is http, optionally specify if the server
# is using http or https

HTTPS=FALSE


# Viya Authentication
# The mcp server support different ways to authenticate(see section on Authentication)

# * sascli * will look for tokens created with sas-viya cli
# * token * a custom token
# * password * userid/password 
# * none *  No aut tokens are created - useful if you want to control authentication

AUTHFLOW=sascli
SAS_CLI_CONFIG=your-home-directory
SAS_CLI_PROFILE=your-sas-cli-profile

# VIYA_SERVER URL for AUTHFLOW of token and password

VIYA_SERVER= your Viya server url

# if AUTHFLOW=token, specify the file with the token
TOKENFILE=

# if password flow specify these
CLIENTID=
CLIENTSECRET=
PASSWORD=

# When HTTPS is TRUE, specify the folder with SSL certificates for the mcp server
# All files in that folder will be loaded and used in the TLS connection
# If not set and HTTPS is true, the server will create a self-signed certificate

SSLCERT=<some folder>


# This certificate isused in the http calls to SAS Viya from MCP server
# Used in restaf (ultimately axios and fetch)
# All files in the folder will be loaded and used in the TLS connection
# if not set, no ssl certificates will be used
# See the script in scripts/getViyaca.sh to get this certificate from the SAS Viya server

VIYACERT=<some folder>

# SAS Contexts
# These are for the CAS and SAS sessions
# Defaults are:
COMPUTECONTEXT=SAS Job Execution compute context
CASSERVER=cas-shared-default

```

## Authentication
The server supports multiple ways to authenticate.

### sas-viya cli

> Note: To use this, set `AUTHFLOW=sascli`

This MCP server CLI works similar to SAS supplied sas-viya CLI commands.
Use the following command to create the necessary token and refresh token.

`create a default auth Profile`.
Issue this command and follow instruction: `sas-viya profile init`

`create token`
Issue this command and follow the instructions: `sas-viya auth loginCode`

You need to do this once every 90 days or whenever the refresh token expires.

At this point the tools can make authenticated calls to SAS Viya.

### Password

> Note: To use this, set `AUTHTYPE=password`

Ths requires additional setup:

- Create a clientid and client password for Oauth password flow.
- Set these in the .env file or the mcp configuration file

### Custom token

> Note: To use this,  set `AUTHTYPE=token`

Set the env TOKENFILE to a file containing the token.

There seems to be a pattern of using a long-lived token.
If this is your use case, set the TOKENFILE to a file containing this token.

### Oauth - Authentication handled by the mcp server

In this approach, the mcp client does not participate in the Oauth authentication process.

#### SAS viya setup.

Create a Oauth client  with the following properties

```js
{
  auth flow: authorization_code
  clientid: <your client id>
  clientsecret: <some client secret - pkce not supported at this time>
  redirect: https://localhost:8080/mcpserver
}

#### Use an .env file as follows(sample values shown)

```env

PORT=8080
HTTPS=true
MCPTYPE=http
USELOGON=FALSE
USETOKEN=TRUE
APPNAME=mcpserver
APPHOST=localhost
APPPORT=8080

CLIENTID=mcpserver
CLIENTSECRET=jellico
AUTHFLOW=code
SSLCERT=c:\Users\kumar\.tls 
VIYACERT=c:\Users\kumar\viyaCert
CAS_SERVER=cas-shared-default
COMPUTECONTEXT=SAS Job Execution compute context
SAMESITE=Lax,false

```

#### Usage

Start the server with this command:

```sh
npx @sassoftware/sas-score-mcp-serverjs@latest
```

Then visit this site on your browser:

```sh
https://localhost:8080/mcpserver
```

You will be prompted to logon to SAS Viya.
A dialog will be displayed if the logon was successful.
Icon this window and proceed to your mcp client


## Transport Methods
This server supports both stdio and http transport methods.

### stdio transport
This is ideal for running mcp servers locally.
Most clients will autostart the mcp server for you.

The env variables can be specified in two ways:

1. As part of the mcp configuration as shown below.
2. Create a .env file and specify the env variables in that file.


> Note: You must set the MCPTYPE in the environment variable.

```json
  "sasmcp": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "@sassoftware/sas-score-mcp-serverjs@latest",
    ],
    "env": {
      "MCPTYPE": "stdio",
      "AUTHFLOW": "sascli",  // sascli|password|token|none
      "SAS_CLI_PROFILE": "cli profile name or Default",
      "SAS_CLI_CONFIG":"where sas-cli stores authentication information",
      "SSLCERT": "where you have stored the tls information(see below)",
      "VIYACERT": "where you have stored the viya server ssl certificates for calls to Viya server",
      "VIYA_SERVER": "viya server if AUTHFLOW=password|token|refresh",
      "PASSWORD": "password if AUTHFLOW is password",
      "USERNAME": "username if AUTHFLOW is password",
      "CLIENTID": "client password if AUTHFLOW is password",
      "CLIENTSECRET": "client id if AUTHFLOW is password",
      "TOKENFILE": "file if AUTHFLOW is token",
      "COMPUTECONTEXT": "SAS Job Execution compute context",
      "CASSERVER": "cas-shared-default",
    }
  }

```

### http transport

This is an alternate to using stdio.
This requires the .env file, which has the necessary configuration values described earlier in this document.
It also requires the MCP server to be running (see step 2).

> Remote MCP servers: This is under development

#### Step 1: Configure the mcp client for localhost

The mcp configuration is show below

```json
 "sasmcp": {
    "type": "http",
    "url": "http(s)//localhost:8080/mcp"``
 }
```

Here is a typical .env file for http transport. Note the value of MCPTYPE.

```env

PORT=8080
HTTPS=FALSE
MCPTYPE=http
VIYA_SERVER=https://myviya.com
AUTHFLOW=sascli
SAS_CLI_PROFILE=00m
SAS_CLI_CONFIG=c:\Users\<yourusername>
SSLCERT=c:\Users\yourusername\.tls 
VIYACERT=c:\Users\yourusername\viyaCert
CAS_SERVER=cas-shared-default
COMPUTECONTEXT=SAS Job Execution compute context

```
Use https if the environment variables HTTPS=TRUE


#### Step 2: Start the mcp server

If using stdio transport, most of the mcp clients will start the server automatically.
But this step is necessary of using http transport.


```sh
npx @sassoftware/sas-score-mcp-serverjs@latest
```

Make sure that the .env file is in the current working directory


## Notes

The mcp server caches information for each mcp session id(user). 

However, cas and compute sessions are not cached in this release(TBD).
The implication of this design choice is felt most when the tool needs is creating compute session * the requests will take longer than when the compute session is cached.

## Other Useful Tips

### mkcert
To create a self-signed certificate for localhost:

```sh
mkcert -install
```

The install also stores local root Certificate Authority (CA) on the system.
For windows the location is `AppData/Local\mkcert`.

Now go to the location where you want to store the certificates.
Then create the certificates:

```sh
mkcert -key-file key.pem -cert-file crt.pem localhost 127:0.0.1 ::1
```

One last step for windows nodejs users.
Add this to the environment variable `NODE_EXTRA_CA_CERTS`:

```text
NODE_EXTRA_CA_CERTS=c:\Users\<your_username>\AppData\Local\mkcert\rootCA.pem
```

## License
This project is licensed under the [Apache 2.0 license](LICENSE).

## Additional Resources

* [Documentation on modelcontextprotocol(mcp)](https://modelcontextprotocol.io/introduction)
* [mcp sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
* [restaf](https://sassoftware.github.io/restaf/)
* [mkcert](https://www.npmjs.com/package/mkcert)
* [SAS tokens](https://communities.sas.com/t5/SAS-Communities-Library/SAS-Viya-CLI-Token-Expiry/ta-p/848183)
* Also see <https://communities.sas.com> for articles on using mcp servers with SAS Viya
