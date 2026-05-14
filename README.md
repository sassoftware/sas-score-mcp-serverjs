# sas-score-mcp-serverjs
A Model Context Protocol (MCP) Server for Scoring with SAS Viya. 
See [wiki](https://github.com/sassoftware/sas-score-mcp-serverjs/wiki) for the capabilities of the server.

## Major changes in release 1.0.0

- Authentication: Oauth flow is now supported. 
   - Note that for Claude the mcp server must be remote. (ex: as a Azure Client App, Azure Container App etc...). 

- Agent - can be deployed as an agent

- Docker image:  ghcr.io/sassoftware/sas-score-mcp-serverjs


## Overview
This MCP server is designed for scoring with SAS Viya.

> Note: **scoring** refers to executing any code that takes some input and returns results.

Some examples are:

- models created with SAS solutions like Model Studio, Intelligent Decisioning etc...
- user written SAS program
  - SAS Studio Flow
  - job Definitions
  - jobs using SAS Studio or other interfaces

## Start the mcp server

If using stdio transport, most of the mcp clients will start the server automatically.
But for http transport, the mcp server must be started. 

If running locally
```sh
npx @sassoftware/sas-score-mcp-serverjs@latest
```

The mcp is also available as a docker image. Add or remove the env variables as needed.

```sh
docker run -p 8080:8080 --name sasscore -e VIYA_SERVER=<yourviyaserver> -e AUTHFLOW=oauth ghcr.io/sassoftware/sas-score-mcp-serverjs:latest
```

## Capabilities

The tools can be grouped into these categories

- Scoring with MAS models, job, jobdef and scr
- Viewing and querying tables

Supporting tools can be grouped into these categories
- Listing of  MAS models, job, jobdef , tables
- Describing MAS models, job, jobdef, scr and tables

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

1. VIYA_SERVER=
   <url for Viya server>. 

### Options with defaults

These can be customized

1. AUTHFLOW=**oauth**|oauthclient|bearer|sascli|token|password 
    - Authentication method. Default is oauth

2. CLIENTID=**vscodemcp** 
     - Clientid for oauth and oauthclient AUTHFlOW. Must be PKCE clientid. 
     

3. MCPTYPE=**http**|stdio  
    - The transport protocol for the mcp server. 

4. MCPHOST=**http://localhost:8080**
   - URL of the mcp server. If using remote mcp server, set this to remote MCP server

5. PROFILE=**~/.sas**
    - profile name used by sas-cli to store the tokens 

6. PORT=**8080**
    - set it to what fits your environment. 

7. CASSERVER=**cas-shared-default** 
    - Set to a valid cas server

8. COMPUTECONTEXT=**"SAS Job Execution compute context"**
    - Use one that is appropriate

### Clientid specifications

If using remote mcp server, change the url in redirect to the remote url

```js
{
  client_id: 'vscodemcp',
  scope: [ 'openid' ],
  resource_ids: [ 'none' ],
  autoapprove: true,
  authorized_grant_types: [ 'authorization_code' ],
  access_token_validity: 86400,
  allowpublic: true,
  redirect_uri: [ 'http://localhost:8080/callback' ]
}
```

> OauthClient Flow. Clientid with redirect appropriate for the client. Some examples are shown below. Note that the explicit port used by github copilot is not guaranteed. 

- github copilot: http://127.0.0.1:33418/
- claude: https://claude.ai/api/mcp/auth_callback,https://claude.ai/api/auth/callback


## Agent and skills

> The mcp server can be deployed as an agent in github copilot
> The configuration files for claude can be installed locally. You have to move the files to the appriopiate place.

To download the skills to your environment issue this command:

```sh
npx @sassoftware/sas-score-mcp-serverjs --skills github|claude
```
The skills and related files will be written to .github or .claude 


## Configure the mcp client for localhost

The mcp configuration for oauth flow. For remote mcp, change the url to the
remote url.

```json
 "sasmcp": {
    "type": "http",
    "url": "http://localhost:8080/mcp"
    "oauth: {
      "type": "oauth2"
    }
 }
```

For bearer authflow. 
```json
 "sasmcp": {
    "type": "http",
    "url": "http://localhost:8080/mcp`,
    "headers" {
      "Authorization": "bearer <tokenstring>"
      }
 }
```

For stdio scenario
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
This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).

The container image published from this repository also includes third-party software, each component under its own license:

- The npm dependencies that ship with this project, along with their respective licenses, are listed in [LICENSES.json](LICENSES.json).
- The container is built from the 25-alpine base image; license texts for its included software ship inside the image itself. License information for each Alpine package is available at [pkgs.alpinelinux.org](https://pkgs.alpinelinux.org/packages).

As with any container image, direct and indirect dependencies are governed by their own licenses.
Users of the published container image are responsible for ensuring that their use complies with all applicable licenses.

## Additional Resources

* [Documentation on modelcontextprotocol(mcp)](https://modelcontextprotocol.io/introduction)
* [mcp sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
* [restaf](https://sassoftware.github.io/restaf/)
* [mkcert](https://www.npmjs.com/package/mkcert)
* [SAS tokens](https://communities.sas.com/t5/SAS-Communities-Library/SAS-Viya-CLI-Token-Expiry/ta-p/848183)
* Also see <https://communities.sas.com> for articles on using mcp servers with SAS Viya
