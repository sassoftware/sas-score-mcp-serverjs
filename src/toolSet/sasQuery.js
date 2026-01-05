/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import {z} from 'zod';
import _jobSubmit from '../toolHelpers/_jobSubmit.js';


function sasQuery() {
 
    let description = `
## sas-query — convert natural language questions into SQL queries and execute them

LLM Invocation Guidance (When to use)
Use THIS tool when:
- User asks a natural language question about table data: "how many customers by region?"
- User wants aggregated analytics: "show total sales by year"
- User needs complex filtering: "find all orders over $1000 from last month"
- User requests joined data: "show products with their category names"
- User wants statistical summaries: "average, min, max salary by department"
- User asks for specific calculations: "percentage of customers by state"

Do NOT use this tool for:
- Reading raw table data without filtering (use read-table)
- Getting table structure or column info (use table-info)
- Running pre-written SAS programs (use run-sas-program)
- Running jobs or job definitions (use run-job or run-jobdef)
- Executing macros (use run-macro)
- Simple table reads with no aggregation (use read-table)

Purpose
Convert natural language queries into SAS PROC SQL SELECT statements and execute them to retrieve analyzed data. The LLM generates the SQL from the natural language query, and this tool executes it against the specified table.

Parameters
- table (string, required): Table name in lib.table format (e.g., "Public.cars", "sashelp.class")
- query (string, required): Natural language description of what data you want
- sql (string, optional): Pre-generated SQL SELECT statement (LLM should generate this from the query)
- job (string, default 'program'): Job name to execute the query (default is 'program')

Behavior & Processing
- LLM converts the natural language query into a valid SAS PROC SQL SELECT statement
- Do not add semicolons to the end of SQL statements
- SQL reference: https://go.documentation.sas.com/doc/en/pgmsascdc/v_067/sqlproc/n0w2pkrm208upln11i9r4ogwyvow.htm
- Tool executes the generated SQL against the specified table
- Returns data in JSON format

Response Contract
Returns a JSON object containing:
- rows: Array of row objects with query results
- columns: Column metadata from the query result
- log: Execution log if available
- If error: structured error message
- If more than 10 rows: only first 10 displayed (ask user if they want more)

Disambiguation & Clarification
- If table missing: ask "Which table should I query (format: lib.tablename)?"
- If query too vague: ask "Can you be more specific about what data or calculation you want?"
- If table format unclear: ask "Please specify table as library.tablename (e.g., Public.cars)"
- If ambiguous calculation: ask for clarification on what to aggregate or filter

Examples (→ mapped params)
- "how many cars by make in sashelp.cars" → { table: "sashelp.cars", query: "how many cars by make", sql: "SELECT make, COUNT(*) AS count FROM sashelp.cars GROUP BY make" }
- "average horsepower by origin" → { table: "sashelp.cars", query: "average horsepower by origin", sql: "SELECT origin, AVG(horsepower) AS avg_hp FROM sashelp.cars GROUP BY origin" }
- "total sales over $1000 by region" → { table: "mylib.sales", query: "total sales over $1000 by region", sql: "SELECT region, SUM(amount) AS total FROM mylib.sales WHERE amount > 1000 GROUP BY region" }
- "percentage of students by year in Public.students" → { table: "Public.students", query: "percentage by year", sql: "SELECT year, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Public.students) AS pct FROM Public.students GROUP BY year" }

Negative Examples (should NOT call sas-query)
- "read table cars from sashelp" (use read-table instead)
- "show me 10 rows from customers" (use read-table instead)
- "what columns are in the sales table?" (use table-info instead)
- "run this SAS code: proc sql; select * from..." (use run-sas-program instead)
- "execute job monthly_report" (use run-job instead)
- "run macro summarize_data" (use run-macro instead)

Usage Tips
- Ensure table is specified in lib.tablename format
- Be specific in natural language queries for better SQL generation
- Use table-info first to understand column names and types
- For simple reads without filtering/aggregation, prefer read-table

Related Tools
- read-table — for simple data reading without SQL queries
- table-info — to inspect table schema before querying
- run-sas-program — for executing pre-written SAS/SQL code
- find-table — to verify table exists before querying
`;


    let spec = {
        name: 'sas-query',
        aliases: ['sasQuery','sas query','sas_query'],
        description: description,
        schema: {
            query: z.string(),
            table: z.string(),
            sql: z.string().optional(),
            job: z.string().default('program')
        },
        required: ['query', 'table'],
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
