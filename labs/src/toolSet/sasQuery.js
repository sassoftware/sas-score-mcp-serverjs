/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import {z} from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';

function sasQuery() {
 
    let description = `
sas-query â€” convert natural language questions into SQL queries and execute them.

USE when: how many/count/total/average by, aggregated analytics, complex filtering, statistical summaries
DO NOT USE for: raw reads without filtering (use read-table), table structure (use table-describe), SAS programs (use score-program), jobs/jobdefs

PARAMETERS
- table: string â€” table in lib.table format (required), e.g. "Public.cars" or "sashelp.class"
- query: string â€” natural language question (required)
- sql: string â€” pre-generated SQL SELECT (optional, LLM generates)
- job: string (default: 'program') â€” job name to execute

ROUTING RULES
- "how many cars by make in sashelp.cars" â†’ { table: "sashelp.cars", query: "how many cars by make", sql: "SELECT make, COUNT(*) FROM sashelp.cars GROUP BY make" }
- "average salary by department in Public.employees" â†’ { table: "Public.employees", query: "average salary by department", sql: "SELECT department, AVG(salary) FROM Public.employees GROUP BY department" }

EXAMPLES
- "how many cars by make in sashelp.cars" â†’ { table: "sashelp.cars", query: "how many cars by make", sql: "SELECT make, COUNT(*) FROM sashelp.cars GROUP BY make" }
- "total sales by region from mylib.sales" â†’ { table: "mylib.sales", query: "total sales by region", sql: "SELECT region, SUM(amount) FROM mylib.sales GROUP BY region" }

NEGATIVE EXAMPLES (do not route here)
- "read table cars" (use read-table)
- "show 10 rows" (use read-table)
- "table structure" (use table-describe)
- "run SAS code" (use score-program)
- "run job/macro" (use score-job/score-macro)

ERRORS
Returns rows array, columns metadata, log. Returns error if SQL invalid or table not found.
  `;


    let spec = {
    name: 'sas-query',
    description: description,
        inputSchema: z.object({
      query: z.string(),
      table: z.string(),
      sql: z.string().optional()
    }),
    handler: async (params) => {
            let {table,query, sql, job, _appContext} = params;
            let sqlinput = (sql == null) ? ' ' : sql.replaceAll(';', ' ').replaceAll('\n', ' ').replaceAll('\r', ' ');
            
            let iparams = {
                scenario: {
                    table: table,
                    prompt: query,
                    sql: sqlinput
                },
                name: (job == null) ? 'program' : job,
                type: 'job',
                query: true,
                _appContext: _appContext
            };
            if (sql == null || sql.trim().length === 0) {
                return { content: [{ type: 'text', text: 'Error: The SQL statement generated is blank. Please provide a valid natural language query that can be converted to SQL.' }] };
            }
         
            let r = await _jobSubmit(iparams);
            return r;
            
           }
        }
    return spec;
}
export default sasQuery;



