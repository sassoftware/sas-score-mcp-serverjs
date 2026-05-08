# Advantages of Using Clients to Reduce Context

Based on your repository architecture, here's a summary of why using specialized clients reduces context bloat:

## 1. **Domain-Specific Focus**
- Each client/agent has **focused instructions** for its domain (e.g., SAS Viya expert vs. general explorer)
- Avoids loading irrelevant tool descriptions, skills, or workflows
- Example: The SAS Viya Scoring Expert doesn't need coding/debugging guidance

## 2. **Reduced Token Overhead**
- Each client loads **only relevant skills** for its purpose
- The main agent doesn't need to know about all possible workflows simultaneously
- SAS Viya client loads SAS skills; Explore client doesn't
- Saves tokens on every request

## 3. **Clearer Decision Tree**
- **Pre-filtered tool set** — Clients don't need to search through all tools to find the right one
- Request classification is faster when the agent already knows its domain
- Reduces ambiguity handling cycles

## 4. **Better Routing Logic**
- Clients are **pre-configured** for their domain
- The SAS Viya expert immediately applies skill-first behavior; doesn't need to decide if a request is SAS or generic
- Eliminate "should I use the SAS tools or general tools?" decision loop

## 5. **Isolated Context State**
- Each client maintains its **own context window efficiently**
- If one client hits a large operation, it doesn't pollute another client's context
- Each agent can be optimized independently

## 6. **Scalability**
- You can **add new specialized clients** without inflating the main context
- Example: Future "SAS Administrator Client" or "Data Analyst Client" stays separate
- Main system doesn't grow with each new use case

## 7. **User Experience**
- Users select **the right tool for their task** upfront (dropdown choice)
- Reduces back-and-forth clarification
- Agent doesn't waste tokens trying to figure out what domain the user is in

---

## Example from Your Repository

**Without clients:** All tools, skills, and workflows loaded simultaneously
- SAS skills + coding skills + debugging skills + exploration skills = large context

**With clients:**
- **SAS Viya Scoring Expert** loads: SAS skills only
- **Explore** loads: discovery/search skills only

This is why your repository separates copilot-instructions.md (main) from `agents/sas-viya-scoring-expert.md` (specialized).