#!/usr/bin/env python3
import re

# DevaScore optimization
deva_old = '''    let description = `
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
- For multiple numbers, chain calls: devaScore(1,2)→126, then devaScore(126,3)→5418

Negative Examples (should NOT call deva-score)
- "Score this customer with the credit model" (use model-score instead)
- "Calculate the mean of these values" (use run-sas-program or sas-query instead)

Related Tools
- None directly related (this is a specialized scoring tool)

Notes
For sequences of numbers, use a left-to-right fold: call devaScore(first, second), then use that result as the first parameter for devaScore(result, third), and so on.
`;'''

deva_new = '''    let description = `
deva-score — compute a numeric score based on two input values.

USE when: calculate deva score, score these values, compute score for numbers
DO NOT USE for: model scoring (use model-score), statistical calculations, data lookup

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
- "Score this customer with credit model" (use model-score)
- "Calculate the mean of these values" (use run-sas-program or sas-query)
- "Statistical analysis of numbers" (use sas-query)

RESPONSE
Returns { score: (a + b) * 42 }
    `;'''

files = {
    'src/toolSet/devaScore.js': (deva_old, deva_new),
}

for filepath, (old, new) in files.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old in content:
            content = content.replace(old, new)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated {filepath}")
        else:
            print(f"✗ Pattern not found in {filepath}")
    except Exception as e:
        print(f"✗ Error updating {filepath}: {e}")
