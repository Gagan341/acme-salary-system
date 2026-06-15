"""Rule-based natural-language query engine for the AI Insights page.

No LLM/OpenAI: we interpret a small, well-defined set of HR questions by
extracting intent (keywords) + entities (known departments/countries) and
mapping them to analytics operations. Each answer reports the equivalent SQL
so the user can see *why* they got the result — that transparency is the point.

Supported question shapes:
  * Which department has the highest / lowest average salary?
  * What is the total payroll cost in <country>?
  * Show top [N] paid employees in <department>?
  * What is the average salary in <department|country>?
  * How many employees are in <department|country>?
"""
import re

from app.schemas.analytics import InsightResponse
from app.schemas.employee import COUNTRIES, DEPARTMENTS
from app.services.analytics_service import AnalyticsService
from app.services.fx import to_usd


def _find(entities: list[str], text: str) -> str | None:
    """Return the first known entity name appearing in the text (case-insensitive)."""
    for name in entities:
        if re.search(rf"\b{re.escape(name.lower())}\b", text):
            return name
    return None


class InsightsService:
    def __init__(self, analytics: AnalyticsService):
        self.analytics = analytics

    def query(self, question: str) -> InsightResponse:
        q = question.lower().strip()
        dept = _find(DEPARTMENTS, q)
        country = _find(COUNTRIES, q)

        # 1) highest / lowest average salary by department
        if "average" in q and "salary" in q and "department" in q and not dept:
            highest = "lowest" not in q
            groups = self.analytics.by_department()
            groups.sort(key=lambda g: g.average_salary_usd, reverse=highest)
            top = groups[0]
            word = "highest" if highest else "lowest"
            return InsightResponse(
                interpreted=f"Department with the {word} average salary (USD-normalized).",
                sql_explanation=(
                    "SELECT department, AVG(salary_usd) AS avg_salary "
                    "FROM employees GROUP BY department "
                    f"ORDER BY avg_salary {'DESC' if highest else 'ASC'} LIMIT 1;"
                ),
                result_type="table",
                columns=["Department", "Avg Salary (USD)", "Headcount"],
                rows=[[top.name, top.average_salary_usd, top.headcount]],
            )

        # 2) total payroll cost in <country>
        if "payroll" in q and country:
            groups = {g.name: g for g in self.analytics.by_country()}
            g = groups.get(country)
            total = g.total_payroll_usd if g else 0.0
            return InsightResponse(
                interpreted=f"Total payroll cost for {country} (USD-normalized).",
                sql_explanation=(
                    "SELECT SUM(salary_usd) FROM employees "
                    f"WHERE country = '{country}';"
                ),
                result_type="scalar",
                columns=["Total Payroll (USD)"],
                rows=[[round(total, 2)]],
                message=f"Total payroll in {country}: ${total:,.2f} USD",
            )

        # 3) top [N] paid employees in <department>
        if "top" in q and ("paid" in q or "salary" in q or "highest" in q) and dept:
            m = re.search(r"top\s+(\d+)", q)
            n = int(m.group(1)) if m else 10
            people = [e for e in self.analytics.top_paid(limit=1000) if e.department == dept][:n]
            return InsightResponse(
                interpreted=f"Top {n} highest-paid employees in {dept}.",
                sql_explanation=(
                    "SELECT employee_id, first_name, last_name, salary "
                    f"FROM employees WHERE department = '{dept}' "
                    f"ORDER BY salary_usd DESC LIMIT {n};"
                ),
                result_type="table",
                columns=["Employee ID", "Name", "Designation", "Salary (USD)"],
                rows=[[p.employee_id, p.name, p.designation, p.salary_usd] for p in people],
            )

        # 4) average salary in <department|country>
        if "average" in q and "salary" in q and (dept or country):
            if dept:
                groups = {g.name: g for g in self.analytics.by_department()}
                g = groups.get(dept)
                scope, field = dept, "department"
            else:
                groups = {g.name: g for g in self.analytics.by_country()}
                g = groups.get(country)
                scope, field = country, "country"
            avg = g.average_salary_usd if g else 0.0
            return InsightResponse(
                interpreted=f"Average salary in {scope} (USD-normalized).",
                sql_explanation=(
                    f"SELECT AVG(salary_usd) FROM employees WHERE {field} = '{scope}';"
                ),
                result_type="scalar",
                columns=["Average Salary (USD)"],
                rows=[[round(avg, 2)]],
                message=f"Average salary in {scope}: ${avg:,.2f} USD",
            )

        # 5) headcount in <department|country>
        if ("how many" in q or "headcount" in q or "count" in q) and (dept or country):
            scope, field = (dept, "department") if dept else (country, "country")
            groups = (
                {g.name: g for g in self.analytics.by_department()}
                if dept else
                {g.name: g for g in self.analytics.by_country()}
            )
            g = groups.get(scope)
            count = g.headcount if g else 0
            return InsightResponse(
                interpreted=f"Headcount in {scope}.",
                sql_explanation=f"SELECT COUNT(*) FROM employees WHERE {field} = '{scope}';",
                result_type="scalar",
                columns=["Headcount"],
                rows=[[count]],
                message=f"{scope} has {count} employees.",
            )

        # fallback — tell the user what we *can* answer
        return InsightResponse(
            interpreted="Could not confidently interpret the question.",
            sql_explanation="-- no query executed --",
            result_type="message",
            message=(
                "I couldn't map that to a known query. Try:\n"
                "• Which department has the highest average salary?\n"
                "• What is the total payroll cost in India?\n"
                "• Show top 5 paid employees in Engineering\n"
                "• What is the average salary in Germany?\n"
                "• How many employees are in Sales?"
            ),
        )
