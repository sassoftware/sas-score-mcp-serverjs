# Tool Description Template - Quick Reference

## The 9 Essential Sections

Every tool description should follow this exact structure:

### 1️⃣ **Title Line**
```markdown
## toolName — brief one-liner description
```
- Clear, action-oriented
- Include purpose/benefit
- Use em dash (—) not colon

### 2️⃣ **LLM Invocation Guidance (When to use)**
```markdown
Use THIS tool when:
- "example user request 1"
- "example user request 2"
- "example user request 3"
```
- Explicit: "Use THIS tool when..."
- Real user phrases with quotes
- 3-5 examples
- Show actual language patterns

### 3️⃣ **Do NOT use this tool for:**
```markdown
- What NOT to do (use toolX instead)
- Another misuse case (use toolY instead)
- Common misconception (use toolZ instead)
```
- List what NOT to do
- Always specify alternative tool
- Prevent tool misuse

### 4️⃣ **Purpose**
```markdown
Clear explanation of what this tool does.
1-3 sentences maximum.
Explain the business value, not just mechanics.
```
- Concise (1-3 sentences)
- Focus on "why" not just "what"
- Explain when/why someone uses it

### 5️⃣ **Parameters**
```markdown
- paramName (type, default): Description of what this parameter does.
- anotherParam (type, required): Description explaining constraints.
```
- Every parameter documented
- Format: `name (type, default): description`
- Include constraints: `(1-100)`, `(required)`, `(optional)`
- Add examples of valid values

### 6️⃣ **Response Contract**
```markdown
Returns a JSON object containing:
- fieldName: Description of what this field contains
- otherField: Type and description
- Empty array if no results
- Error cases and how they're represented
```
- Describe JSON structure
- List key fields and types
- Cover edge cases (empty, null, errors)
- Example response helpful

### 7️⃣ **Disambiguation & Clarification**
```markdown
- If user says "X" without specifying Y: ask "Did you mean Z?"
- If parameter is missing: ask "Which [param] would you like?"
- Handle multiple requests: clarify which one
```
- Format: `- If user says "X" → ask "[question]"`
- Exact questions to ask (in quotes)
- Edge cases and confusion points

### 8️⃣ **Examples (→ mapped params)**
```markdown
- "user phrase example 1" → { param: "value", limit: 10 }
- "another user request" → { param: "value" }
- "with different params" → { param1: "x", param2: "y" }
```
- Real user phrases (with quotes)
- Arrow notation: `→`
- Show parameter mappings
- 3-5 examples covering different scenarios

### 9️⃣ **Negative Examples (should NOT call toolName)**
```markdown
- "incorrect user request" (use toolX instead)
- "another common mistake" (use toolY instead)
```
- Show what NOT to do
- Always specify correct tool
- 2-3 examples of common mistakes

### 🔟 **Related Tools** (optional but recommended)
```markdown
- listThing → findThing → infoThing → actionThing (typical workflow)
- otherTool — description of how it relates
```
- Show workflow chains
- Show prerequisites
- Show follow-up tools

---

## Formatting Checklist

- [ ] Use `## title` for main header
- [ ] Use `###` or bold for section headers
- [ ] Use `- ` for bullet points
- [ ] Use `` `code` `` for parameter/field names
- [ ] Use quotes `"..."` for example user phrases
- [ ] Use em dash `→` in examples (not arrow)
- [ ] Use em dash `—` in title (not colon or dash)
- [ ] Consistent indentation
- [ ] No typos (spell-check parameter names)

---

## Parameter Documentation Format

**Minimal:**
```
- name (string): Description.
```

**With defaults:**
```
- name (string, default 'value'): Description.
```

**With constraints:**
```
- name (number, 1-100, default 10): Description.
```

**Optional parameter:**
```
- name (string, optional): Description.
```

**Required parameter:**
```
- name (string, required): Description.
```

---

## Example Parameter Variations

```markdown
Parameters
- model (string, required): The name of the model to analyze.
- limit (number, default 10): Maximum results (1-1000).
- where (string, optional): SQL-style filter clause.
- server (string, default 'cas'): Target server: 'cas' or 'sas'.
- format (boolean, default true): Return formatted values when true.
```

---

## Response Contract Examples

### Simple (scalar return)
```markdown
Response Contract
Returns a JSON object with:
- result: The computed numeric value (number)
```

### Array return
```markdown
Response Contract
Returns an array of objects:
- Each object contains { name: string, value: any }
- Empty array if no results found
```

### Complex structure
```markdown
Response Contract
Returns a JSON object with:
- models: Array of model objects containing:
  - name: Model name (string)
  - type: Model type (string)
  - metadata: Optional model metadata (object)
- count: Total number of models (number)
- pageInfo: Pagination information if applicable
```

---

## Example vs Negative Example Format

**Examples format:**
```
- "read 10 rows from customers" → { table: "customers", limit: 10 }
- "get all columns from orders" → { table: "orders" }
```

**Negative Examples format:**
```
- "execute this SQL query" (use sasQuery instead)
- "run this SAS program" (use program instead)
```

---

## Common Mistakes to Avoid

❌ **Bad: Vague description**
```
## listThings

Provides a list of things.
```

✅ **Good: Clear description**
```
## listThings — enumerate available items with pagination support
```

---

❌ **Bad: No usage guidance**
```
Parameters
- name (string): The name
```

✅ **Good: Clear guidance**
```
Parameters
- name (string, required): The exact name of the item to retrieve.
  Names are case-sensitive. Examples: 'myItem', 'item_123'
```

---

❌ **Bad: Abstract examples**
```
Examples
- basic usage
- advanced usage with parameters
```

✅ **Good: Real examples**
```
Examples (→ mapped params)
- "list all models" → { start: 1, limit: 10 }
- "show me 25 models" → { start: 1, limit: 25 }
```

---

❌ **Bad: Missing related tools**
```
[Description ends]
```

✅ **Good: Context**
```
Related Tools
- listMas → findMas → masDescribe → masScore (typical workflow)
- findMas — to check if a specific model exists
- masScore — to score using this model
```

---

## Section Order (IMPORTANT)

Always use this exact order:
1. Title
2. LLM Invocation Guidance (When to use)
3. Do NOT use this tool for
4. Purpose
5. Parameters
6. Response Contract
7. Disambiguation & Clarification
8. Examples (→ mapped params)
9. Negative Examples
10. Related Tools (optional)

---

## Line Length Guidelines

- Keep lines under 100 characters for readability
- Parameter descriptions can wrap across 2-3 lines
- Real-world example lines can be longer if needed

---

## Testing Your Description

Before submitting, verify:

1. **Can an LLM understand when to use this?**
   - Read the "LLM Invocation Guidance" section
   - Does it have real user phrase examples?

2. **Can an LLM understand what NOT to do?**
   - Read the "Do NOT use" section
   - Does it specify which tool to use instead?

3. **Can an LLM invoke this correctly?**
   - Look at the "Examples" section
   - Are parameter mappings clear and realistic?

4. **Does it match the template format?**
   - Use the 9-section checklist above
   - All required sections present?
   - Proper markdown formatting?

5. **Is it consistent with other tools?**
   - Same structure as similar tools?
   - Same tone and style?
   - Same level of detail?

---

## Quick Copy-Paste Template

```markdown
## toolName — brief one-liner

LLM Invocation Guidance (When to use)
Use THIS tool when:
- "example 1"
- "example 2"
- "example 3"

Do NOT use this tool for:
- Wrong use case (use toolX instead)
- Another wrong case (use toolY instead)

Purpose
[1-3 sentences explaining what this tool does]

Parameters
- param1 (type, default): Description
- param2 (type, required): Description

Response Contract
[Describe JSON response structure]

Disambiguation & Clarification
- If user says "X" → ask "question?"
- If missing param → ask "which param?"

Examples (→ mapped params)
- "user request 1" → { param1: "value" }
- "user request 2" → { param1: "value", param2: 10 }

Negative Examples (should NOT call toolName)
- "wrong request" (use toolX instead)
- "another mistake" (use toolY instead)

Related Tools
- toolX — description
- toolY — description
```

---

## Questions?

Refer to:
- `TOOL_DESCRIPTION_TEMPLATE.md` - Detailed specification
- `EXAMPLE_IMPROVEMENTS.md` - Before/after comparisons
- `TOOL_UPDATES_SUMMARY.md` - What was updated
- Updated tool files in `src/toolSet/` - Real examples
