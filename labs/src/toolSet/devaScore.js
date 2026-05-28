/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

function devaScore(_appContext) {

    let description = `
deva-score â€” compute a numeric score based on two input values.

USE when: calculate deva score, score these values, compute score for numbers
DO NOT USE for: model scoring (use mas-score), statistical calculations, data lookup

PARAMETERS
- a: number (required) â€” first input value
- b: number (required) â€” second input value

FORMULA: (a + b) * 42

ROUTING RULES
- "calculate deva score for 5 and 10" â†’ { a: 5, b: 10 }
- "score 1 and 2" â†’ { a: 1, b: 2 }
- "deva score a=3, b=7" â†’ { a: 3, b: 7 }
- Multiple numbers â†’ chain calls left-to-right: call(first, second), then call(result, third)

EXAMPLES
- "Calculate deva score for 5 and 10" â†’ { a: 5, b: 10 } returns 630
- "Score 1 and 2" â†’ { a: 1, b: 2 } returns 126
- "Deva score 20 and 30" â†’ { a: 20, b: 30 } returns 2100

NEGATIVE EXAMPLES (do not route here)
- "Score this customer with credit model" (use mas-score)
- "Calculate the mean of these values" (use program-score or sas-query)
- "Statistical analysis of numbers" (use sas-query)

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


