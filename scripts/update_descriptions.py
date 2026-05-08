#!/usr/bin/env python3
import re
import os

os.chdir('c:/dev/github/sas-score-mcp-serverjs')

# Update runJob.js
file_path = 'src/toolSet/runJob.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_desc = """run-job — execute a deployed SAS Viya job.

USE when: run job, execute job, run with parameters
DO NOT USE for: arbitrary SAS code (use run-sas-program), macros (use run-macro), list/find jobs

PARAMETERS
- name: string — job name (required)
- scenario: string | object — input parameters. Accepts: "x=1, y=2" or {x:1, y:2}

ROUTING RULES
- "run job xyz" → { name: "xyz" }
- "run job xyz with param1=10, param2=val2" → { name: "xyz", scenario: {param1:10, param2:"val2"} }

EXAMPLES
- "run job xyz" → { name: "xyz" }
- "run job monthly_etl with month=10, year=2025" → { name: "monthly_etl", scenario: {month:10, year:2025} }

NEGATIVE EXAMPLES (do not route here)
- "run SAS code" (use run-sas-program)
- "run macro X" (use run-macro)
- "list jobs" (use list-jobs)
- "find job X" (use find-job)

ERRORS
Returns log output, listings, tables from job. Error if job not found."""

# Use a more flexible pattern
pattern = r'let description = `\n## run-job.*?`;\n'
replacement = f'let description = `\n{new_desc}\n`;\n'
updated = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated)

print(f"✓ Updated {file_path}")
