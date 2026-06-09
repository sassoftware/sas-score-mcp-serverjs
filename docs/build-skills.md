# Build-skills - Instructions for Claude to create a set of skills for the sas-score-mcp-serverjs

## Types of resource

### Servers

1. sas - this refers to Viya compute server
2. cas - thsi refers to Viya cas server

### Persisted Models

- mas      - models managed by SAS Viya MAS server
- scr      - models deployed as SAS Container and accessed using http
- jobdef   - models that build around SAS code 
- job      - similar to jobdef - built with SAS code
- casmodel - the model is stored in cas table 

#### Syntax: 
The syntax for these models are <name>.<type> (ex: a.mas).
Examples:

- a.mas
- b.job
- c.jobdef

Exception:
casmodel is referenced as lib.name.cas

#### Common Usage

Users can reference these models using expressions as shown below, but they all mean the same

Example:

model a.mas, mas model a, a.mas model -> a.mas

### Inline models

- program - inline sas code used for scoring
- casl    - inline casl or code stored as a cas server table used for scoring

### Syntax

- "
#### Referencing Models

Users will refer to these models in their prompts as follows:

- Syntax:  name.type
### Data Tables

1. sas tables - these are data tables accessed in the sas server
2. cas tables - these are data tables accessed in the cas server

#### Referencing Tables


