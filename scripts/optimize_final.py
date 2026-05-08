#!/usr/bin/env python3
import re

# Read and replace listJobs
with open('src/toolSet/listJobs.js', 'r') as f:
    content = f.read()

# Find and replace listJobs description - find the full description block
pattern = r'let description = `\n  ## list-jobs.*?  `;'
replacement = r'''let description = `
list-jobs — enumerate SAS Viya job assets.

USE when: list jobs, show jobs, browse jobs, list available jobs, next page of jobs
DO NOT USE for: find single job (use find-job), execute job (use run-job), run jobdef (use run-jobdef), sas code (use run-sas-program)

PARAMETERS
- limit: number (default: 10) — number of jobs per page
- start: number (default: 1) — 1-based page offset
- where: string (default: '') — optional filter expression

ROUTING RULES
- "list jobs" → { start: 1, limit: 10 }
- "show me 25 jobs" → { start: 1, limit: 25 }
- "list jobs limit 50" → { start: 1, limit: 50 }
- "next jobs" (after prior page) → { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- "list jobs" → { start: 1, limit: 10 }
- "list 25 jobs" → { start: 1, limit: 25 }
- "next jobs" → { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- "find job abc" (use find-job)
- "run job abc" (use run-job)
- "list models" (use list-models)

PAGINATION
If returned length === limit, hint: next start = start + limit. Empty result with start > 1 means paged past end.

ERRORS
Surface backend error directly; never fabricate job names.
  `;'''

if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    with open('src/toolSet/listJobs.js', 'w') as f:
        f.write(content)
    print("✓ Updated listJobs.js")
else:
    print("✗ Pattern not found in listJobs.js")

# Read and replace listJobdefs  
with open('src/toolSet/listJobdefs.js', 'r') as f:
    content = f.read()

pattern = r'let description = `\n  ## list-jobdefs.*?  `;'
replacement = r'''let description = `
list-jobdefs — enumerate SAS Viya job definitions (jobdefs) assets.

USE when: list jobdefs, show jobdefs, browse jobdefs, list available jobdefs, next page
DO NOT USE for: find single jobdef (use find-jobdef), execute jobdef (use run-jobdef), find job (use find-job), sas code (use run-sas-program)

PARAMETERS
- limit: number (default: 10) — number of jobdefs per page
- start: number (default: 1) — 1-based page offset
- where: string (default: '') — optional filter expression

ROUTING RULES
- "list jobdefs" → { start: 1, limit: 10 }
- "show me 25 jobdefs" → { start: 1, limit: 25 }
- "next jobdefs" → { start: previousStart + previousLimit, limit: previousLimit }

EXAMPLES
- "list jobdefs" → { start: 1, limit: 10 }
- "list 25 jobdefs" → { start: 1, limit: 25 }
- "next jobdefs" → { start: 11, limit: 10 }

NEGATIVE EXAMPLES (do not route here)
- "find jobdef abc" (use find-jobdef)
- "list jobs" (use list-jobs)
- "run jobdef abc" (use run-jobdef)

PAGINATION
If returned length === limit, hint: next start = start + limit.

ERRORS
Surface backend error directly; never fabricate jobdef names.
  `;'''

if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    with open('src/toolSet/listJobdefs.js', 'w') as f:
        f.write(content)
    print("✓ Updated listJobdefs.js")
else:
    print("✗ Pattern not found in listJobdefs.js")

# Read and replace runCasProgram
with open('src/toolSet/runCasProgram.js', 'r') as f:
    content = f.read()

pattern = r'let description = `\n## run-cas-program.*?Response\n`'
replacement = r'''let description = `
run-cas-program — execute a CAS program on SAS Viya server.

USE when: run cas program, execute cas, submit cas, run cas code, cas action
DO NOT USE for: macros (use run-macro), sas code (use run-sas-program), jobs (use run-job/find-job), jobdefs (use run-jobdef/find-jobdef), models (use find-model)

PARAMETERS
- src: string (required) — CAS program code to execute verbatim
- scenario: string | object (optional) — input parameters. Accepts: "x=1, y=2" or {x:1, y:2}

ROUTING RULES
- "run cas program 'action echo / code=\"xyz\"'" → { src: "action echo / code=\"xyz\"" }
- "submit cas action echo" → { src: "action echo" }
- "cas program with param1=10" → { src: "...", scenario: {param1: 10} }

EXAMPLES
- "run cas program 'action echo / code=\"hello\"'" → { src: "action echo / code=\"hello\"" }
- "execute cas action simple.summary" → { src: "action simple.summary" }

NEGATIVE EXAMPLES (do not route here)
- "run sas macro" (use run-macro)
- "submit sas code" (use run-sas-program)
- "run job X" (use run-job)

NOTES
Sends src verbatim without validation. For SAS macros use run-macro. For arbitrary SAS code use run-sas-program.

RESPONSE
Log output, listings, tables from CAS execution. Error if execution fails.
`'''

if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    with open('src/toolSet/runCasProgram.js', 'w') as f:
        f.write(content)
    print("✓ Updated runCasProgram.js")
else:
    print("✗ Pattern not found in runCasProgram.js")
