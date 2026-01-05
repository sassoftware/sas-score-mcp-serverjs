# Instructions for modifying or adding new tools



## src/toolset

This folder contains all the tools defined. The tools must conform to the MCP standards.
The mcp server will add the branding prefix to the tools. By default it is `sas-score-`.

> If you wish to change the branding, edit cli.js and replace the constant BRAND with your own brand.
Do not specify the branding in the tool definition

> See TOOL_DESCRIPTION_TEMPLATE for recommendations on how to write the description for a tool. And obviously this 
document was created with the help of LLM.

### Parameters to a tool helper

The params to a tool handler is determined by the LLM based on the description of the tool.

In this library that params object is extended with the *_appContext* object. 

A typical handler in the tool spec will now look like this:

```js
{...
    handler: async (params) => {
        let {a,b, _appContext} = params;
        ...rest of the code...
    }
}
```
See the files in src/toolHelpers folder for more examples


### src/toolHelpers

All code related to handling the prompt request are defined in this folder. This is just a convention of the author and not a hard and fast rule.



The _appContext object is shown below

```js
{
    storeConfig: {},/* for restaf users */
    viyaCert: {} /* object with ssl/tsl certificates to connect to viya */
    logonPayload: {}/* viya logon payload  to connect to viya */
    sas: string,  /* 'SAS compute context' - default: SAS Job Execution compute context */
    cas: string /* name of the cas server (default: cas-shared-default*/,
    ext: {} /* place for tool developers to store information */
}
```

The logonPayload object has the following information based on the AUTHFLOW value

#### AUTHTYPE=sascli|token
```js
{
    host: string, /* current Viya Server URL*/
    authType: string /* for restaf users */
    token: string, /* current token */
    tokenType: 'Bearer'
    
}
```

#### AUTHTYPE=pasword

```js
{
    host: viya-host-url
    authType: "password",
    user: string,
    password: string,
    clientID: clientid,
    clientSecret: clientsecret
}

```

