/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import {z} from 'zod';

function devaScore(_appContext) {

    let description = `
## deva-score — compute a numeric score based on two input values

LLM Invocation Guidance (When to use)
Use THIS tool when:
- User wants to calculate the deva score: "Calculate deva score for 5 and 10"
- User provides two numbers for scoring: "Score these values: 3 and 7"
- User wants to compute a score in a series: "Calculate scores for [list of numbers]"

Do NOT use this tool for:
- Scoring models (use model-score)
- Statistical calculations beyond deva scoring
- Looking up data or metadata

Purpose
Compute a numeric deva score by applying the formula (a + b) * 42 to two input numbers. For scoring more than two numbers, call this tool multiple times using the previous result as the first input (left-to-right fold).

Parameters
- a (number, required): First numeric input value
- b (number, required): Second numeric input value

Response Contract
Returns a numeric result: (a + b) * 42
The result is always a number representing the computed deva score.

Disambiguation & Clarification
- If user provides more than two numbers without clear instructions: "Do you want to calculate the deva score by combining these numbers left-to-right?"
- If user provides non-numeric input: "Please provide numeric values"

Examples (→ mapped params)
- "Calculate deva score for 5 and 10" → { a: 5, b: 10 } returns 630
- "Score 1 and 2" → { a: 1, b: 2 } returns 126
- For multiple numbers, chain calls: deva(1,2)→126, then deva(126,3)→5418

Negative Examples (should NOT call deva-score)
- "Score this customer with the credit model" (use model-score instead)
- "Calculate the mean of these values" (use run-sas-program or sas-query instead)

Related Tools
- None directly related (this is a specialized scoring tool)

Notes
For sequences of numbers, use a left-to-right fold: call devaScore(first, second), then use that result as the first parameter for devaScore(result, third), and so on.
`;
    let spec = {
        name: 'deva-score',
        aliases: ['devaScore','deva score','deva_score'],
        description: description,
        schema: {
            a: z.number(),
            b: z.number()
        },
        handler: async ({ a, b,_appContext }) => {
            console.error( a, b);
            return { content: [{ type: 'text', 
                text: String((a + b) * 42) }] }
        }
    }
    return spec;
}
export default devaScore;
