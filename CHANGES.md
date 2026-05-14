# Changes
All notable changes to this project starting with V 1.0.0 will be documented in this file in accordance with semantic versioning.


## 1.0.0

1. Multi-user support
    - Completed multi-user support
2. Full support for Oauth 
    -  Client handles all the oauth flow.
    - Server handles all the oauth flow
3. Added agents and skills
    - Github/copilot - Install agent and skills in ~/.github on start  
    -  Claude
        - Option to store claude agent and skills in ~/.claude
            - Suffficient for claude cli to use the agent
            - For Claude desktop - upload the zipped skills 
4. Public docker image
    -  Available as ghcr.io/sassoftware/sas-score-mcp-serverjs:latest
