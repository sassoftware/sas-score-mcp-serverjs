# Changes
All notable changes to this project will be documented in this file in accordance with semantic versioning.

## V 0.2.0

1. Added support for authorization_code flow.(AUTHFLOW=code)
2. Logon dialog is auto started.
3. Marked as experimental until further testing is completed.

## V 1.0.0

1. Full support for Oauth 
    a. Client handles all the authflow.
    b. Server handles authflow - my preference
2. Added agents and skills
    a. Github/copilot
        - Option to Install agent and skills in ~/.github on start  
    b. Claude
        - Option to store claude agent and skills in ~/.claude
            - Suffficient for claude cli to use the agent
            - For Claude desktop - upload the zipped skills 