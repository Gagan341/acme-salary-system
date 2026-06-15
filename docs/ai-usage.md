# AI Usage

## 1. The "AI Insights" feature (in-product)

The brief explicitly asks **not** to integrate OpenAI, and to instead build a
**rule-based query interpreter**. That is what `app/services/insights_service.py`
implements.

### How it works
1. The question is lower-cased and scanned for **known entities** — department
   and country names (the fixed enumerations) via word-boundary matching.
2. **Intent** is determined by keyword presence (`average`, `payroll`, `top`,
   `how many`, `highest`/`lowest`, etc.).
3. The matched intent maps to an analytics operation and returns:
   - `interpreted` — a plain-English restatement of what was understood,
   - `sql_explanation` — the equivalent SQL (shown to the user for transparency),
   - a typed `result` (scalar / table / message).
4. Unrecognized questions return a helpful message listing supported shapes,
   rather than guessing.

### Supported questions
- Which department has the highest / lowest average salary?
- What is the total payroll cost in `<country>`?
- Show top `[N]` paid employees in `<department>`?
- What is the average salary in `<department|country>`?
- How many employees are in `<department|country>`?

### Why rule-based (product reasoning)
- **Deterministic & auditable** — HR sees the exact SQL behind each answer; no
  hallucinated numbers, which matters for compensation data.
- **Zero cost / latency / data-egress** — no salary data leaves the system.
- **Good enough** — the question space here is small and well-defined. A pattern
  matcher covers it reliably and is trivial to extend. The clean
  intent→operation seam means an LLM translator could be dropped in later behind
  the same `InsightsService` interface without touching the API or UI.

## 2. AI assistance used while building this project

This solution was developed with AI coding assistance. Concretely:
- Scaffolding the layered backend (routes/services/repositories) and the React
  page/component structure.
- Drafting boilerplate: Pydantic schemas, TanStack Query hooks, the seed script,
  Dockerfiles, and documentation.
- Generating test cases for CRUD, analytics math, and the NL parser.

Everything was reviewed, wired together, and **verified by running it**: the
backend test suite (17 tests) and frontend test suite (6 tests) pass, the seed
script and analytics were executed against a real database, the Alembic
migration was applied, and the frontend was type-checked and production-built.
Design decisions (currency normalization, indexing strategy, rule-based NL,
layering) are deliberate and documented in `tradeoffs.md`.
