# Requirements — ACME Employee Salary Management System

## Goal
Replace ACME's error-prone Excel-based salary tracking with a fast, reliable web
application that lets HR manage ~10,000 employee compensation records, analyze
payroll across countries and departments, and answer ad-hoc compensation
questions without writing SQL.

## User Persona
**Priya — HR Manager, ACME (Global).** Manages compensation data for 10,000
employees across 5 countries. Comfortable with spreadsheets, not with databases.
Needs to add/update employees quickly, find a record in seconds, see payroll
totals at a glance, and answer leadership questions like "what's our payroll cost
in India?" on the spot. Cares about accuracy, speed, and trustworthy numbers.

## In Scope
- Employee CRUD (create, view, edit, delete) with validation.
- Fast search by name / email / employee ID.
- Server-side pagination, filtering (country, department, status), and sorting.
- Salary dashboard: total employees, total payroll, average, median, high, low.
- Analytics: salary distribution histogram, salary by department, salary by
  country, headcount by department.
- HR insight APIs: top/bottom 10 paid, averages by dept & country, payroll by
  country.
- Natural-language query page backed by a rule-based interpreter (no external LLM).
- USD normalization of mixed-currency salaries for all aggregates.

## Out of Scope
- Authentication / RBAC / audit logging (assumed handled by an SSO gateway).
- Payroll processing, tax, benefits, or payslip generation.
- Live FX rates (a static, documented rate table is used).
- Bulk import/export and historical salary versioning.
- Multi-tenant support and i18n of the UI.

## Assumptions
- A single trusted HR user group; access control is enforced upstream.
- Salaries are stored in each employee's local currency (per the brief) and
  converted to USD only for cross-currency analytics.
- 10,000 employees is the working scale; design must stay responsive there.
- Email and employee_id are unique per employee.

## Success Metrics
- Employee list + search returns in < 300 ms at 10k rows (indexed, paginated).
- Dashboard and analytics load without manual refresh and stay in sync after edits.
- ≥ 80% of the example NL questions are interpreted correctly by the rule engine.
- HR can create/edit/find an employee in under 15 seconds.
- 80%+ test coverage on core business logic (CRUD, analytics, query parser).
