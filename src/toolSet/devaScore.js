/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

function devaScore(_appContext) {
let brand = _appContext.brand + '-';
    let description = `
deva-score — compute a numeric score based on two input values.

USE when: calculate deva score, score these values, compute score for numbers
DO NOT USE for: model scoring (use ${brand}model-score), statistical calculations, data lookup

PARAMETERS
- a: number (required) — first input value
- b: number (required) — second input value

FORMULA: (a + b) * 42

ROUTING RULES
- "calculate deva score for 5 and 10" → { a: 5, b: 10 }
- "score 1 and 2" → { a: 1, b: 2 }
- "deva score a=3, b=7" → { a: 3, b: 7 }
- Multiple numbers → chain calls left-to-right: call(first, second), then call(result, third)

EXAMPLES
- "Calculate deva score for 5 and 10" → { a: 5, b: 10 } returns 630
- "Score 1 and 2" → { a: 1, b: 2 } returns 126
- "Deva score 20 and 30" → { a: 20, b: 30 } returns 2100

NEGATIVE EXAMPLES (do not route here)
- "Score this customer with credit model" (use ${brand}model-score)
- "Calculate the mean of these values" (use ${brand}score-program or ${brand}sas-query)
- "Statistical analysis of numbers" (use ${brand}sas-query)

RESPONSE
Returns { score: (a + b) * 42 }
    `;
    let spec = {
        name: 'deva-score',
        description: description,
        inputSchema: z.object({
            a: z.number(),
            b: z.number(),
        }),
        handler: async ({ a, b }) => {
            console.error(a, b);
            let r = { score: (a + b) * 42 };
            console.error('deva score result', r);
            return {
                content: [{ type: 'text', text: 'deva score result: ' + JSON.stringify(r) }],
                structuredContent: r
            };
        }
    }

    return spec;
}
export default devaScore;

