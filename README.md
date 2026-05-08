# sas-score-mcp-serverjs
A Model Context Protocol (MCP) Server for Scoring with SAS Viya

## Major changes in release 1.0.0

- Authentication: Oauth flow is now supported. 
   - Note that for Claude the mcp server must be remote. (ex: as a Azure Client App, Azure Container App etc...). 

- Agent - can be deployed as an agent


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


## Transport Protocol supported

- http
- stdio


## Configuration Variables
Typically these are set either in the .env file or as environment variables or as command line options(if using npx).  You will need only a subset of these for the different [transport,authentication] schemes

### Required Options

VIYA_SERVER=<url for Viya server>
MCPTYPE=http|stdio
MCPHOST=<url for the mcp server = http://localhost:8080 or some remote mcp server>

>Recommended authflow is oauth - the most secure of all the options since all oauth flow occurs in the server and the actual token is never sent to the client. Bearer authflow is useful when the mcp server is remote with its own authentication process

AUTHFLOW=oauth|oauthclient|bearer|sascli|token|password

> Options for oauth. The clientid must have a redirect of http://localhost:8080/callback,https://localhost:8080/callback

CLIENTID=<pkce clientid>


> OauthClient Flow. Clientid with redirect appropriate for the client. Some examples are shown below. Note that the explicit port used by github copilot is not guaranteed. 

- github copilot: http://127.0.0.1:33418/
- claude: https://claude.ai/api/mcp/auth_callback,https://claude.ai/api/auth/callback

> bearer - Use this when the remote mcp server sends the token in the header.


> sascli - Use sas-viya cli to create the token information. It is stored in ~/.sas folder by default

```env
PROFILE=<profile name used by sas-cli to store the tokens in ~/.sas> 
```

### Other options

```env
PORT=<default is 8080>
HTTPS=FALSE
CASSERVER=CAS server name (default: cas-shared-default)
COMPUTECONTEXT=Compute session name or context (default: SAS Job Execution compute context) 
```

## Agent

> The mcp server can be deployed as an agent in github copilot
> The configuration files for claude can be installed locally. You have to move the files to the appriopiate place.

Specify the following configuration values to enable agent mode

```env
AGENT=TRUE
MCPCLIENT=github|claude
```

By default the agent information is installed in the user's home directory as .github or .claude} To install it where the mcp server is running do the following:

```env
MCPCLIENT=.github|.claude
```


## Configure the mcp client for localhost

The mcp configuration is show below

```json
 "sasmcp": {
    "type": "http",
    "url": "http://localhost:8080/mcp"``
    "oauth: {
      "type": "oauth2"
    }
 }
```

For remote mcp servers:
```json
 "sasmcp": {
    "type": "http",
    "url": "your remote mcp server`,
    "oauth": {
      "type": 'oauth2
    }
 }
```

For transport protocol stdio. For claude drop the type

```json
"sas-mcp-server": {
      "type: "stdio"
      "command": "npx",
      "args": [
      "-y",
      "@sassoftware/sas-score-mcp-serverjs@1.0.0"
      -v "<your viya url>"
      -m "stdio"
      --profile "dtl"
      -a "sascli"
      ]
    }
```

#### Step 2: Start the mcp server

If using stdio transport, most of the mcp clients will start the server automatically.
But this step is necessary of using http transport.


```sh
npx @sassoftware/sas-score-mcp-serverjs@latest
```

Make sure that the .env file is in the current working directory or specify the options in the command line


## Notes

The mcp server caches information for each mcp session id(user). 

However, cas and compute sessions are not cached in this release(TBD).
The implication of this design choice is felt most when the tool needs is creating compute session * the requests will take longer than when the compute session is cached.

## Other Useful Tips

### mkcert

### Install

1. Visit this [site](https://github.com/FiloSottile/mkcert/releases)
2. Download the proper version 
  - rename the file as mkcert (with proper exetension for your os)
  - move it to a directory that is in the PATH value

To create a self-signed certificate for localhost:

```sh
mkcert -install
```

The install also stores local root Certificate Authority (CA) on the system.
For windows the location is `AppData/Local\mkcert`.

Now go to the location where you want to store the certificates.
Then create the certificates:

```sh
mkcert  localhost 127:0.0.1 ::1
```

One last step for windows nodejs users.
Add this to the environment variable `NODE_EXTRA_CA_CERTS`:

```text
NODE_EXTRA_CA_CERTS=c:\Users\<your_username>\AppData\Local\mkcert\rootCA.pem
```

## License


This project is licensed under the Apache License 2.0. See LICENSE.

The container image published from this repository also includes third-party software, each component under its own license:

The npm dependencies that ship with this project, along with their respective licenses, are listed in LICENSES.json.
The container is built from the 25-alpine base image; license texts for its included software ship inside the image itself.  License information for each Alpine package is available at pkgs.alpinelinux.org.
As with any container image, direct and indirect dependencies are governed by their own licenses. Users of the published container image are responsible for ensuring that their use complies with all applicable licenses.

## Additional Resources

* [Documentation on modelcontextprotocol(mcp)](https://modelcontextprotocol.io/introduction)
* [mcp sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
* [restaf](https://sassoftware.github.io/restaf/)
* [mkcert](https://www.npmjs.com/package/mkcert)
* [SAS tokens](https://communities.sas.com/t5/SAS-Communities-Library/SAS-Viya-CLI-Token-Expiry/ta-p/848183)
* Also see <https://communities.sas.com> for articles on using mcp servers with SAS Viya
