"""Analytics service.

All aggregates are computed in USD (see services/fx.py) because salaries are
stored in mixed local currencies. We load the rows once and reduce in Python:
clear, correct across currencies, and fine for 10k rows. For larger datasets
this would move to a materialized summary table or a cached SQL aggregate with
a CASE-based FX conversion — noted in docs/tradeoffs.md.
"""
import statistics
from collections import defaultdict

from app.repositories.employee_repository import EmployeeRepository
from app.schemas.analytics import (
    EmployeeBrief,
    GroupStat,
    HistogramBucket,
    SummaryStats,
)
from app.services.fx import to_usd


class AnalyticsService:
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    def _usd_salaries(self):
        rows = self.repo.all()
        return rows, [to_usd(float(e.salary), e.currency) for e in rows]

    def summary(self) -> SummaryStats:
        _, usd = self._usd_salaries()
        if not usd:
            return SummaryStats(
                total_employees=0, total_payroll_usd=0, average_salary_usd=0,
                median_salary_usd=0, highest_salary_usd=0, lowest_salary_usd=0,
            )
        return SummaryStats(
            total_employees=len(usd),
            total_payroll_usd=round(sum(usd), 2),
            average_salary_usd=round(statistics.mean(usd), 2),
            median_salary_usd=round(statistics.median(usd), 2),
            highest_salary_usd=round(max(usd), 2),
            lowest_salary_usd=round(min(usd), 2),
        )

    def _group_by(self, attr: str) -> list[GroupStat]:
        rows = self.repo.all()
        buckets: dict[str, list[float]] = defaultdict(list)
        for e in rows:
            buckets[getattr(e, attr)].append(to_usd(float(e.salary), e.currency))
        out = [
            GroupStat(
                name=name,
                headcount=len(vals),
                average_salary_usd=round(statistics.mean(vals), 2),
                total_payroll_usd=round(sum(vals), 2),
            )
            for name, vals in buckets.items()
        ]
        return sorted(out, key=lambda g: g.total_payroll_usd, reverse=True)

    def by_department(self) -> list[GroupStat]:
        return self._group_by("department")

    def by_country(self) -> list[GroupStat]:
        return self._group_by("country")

    def histogram(self, buckets: int = 8) -> list[HistogramBucket]:
        _, usd = self._usd_salaries()
        if not usd:
            return []
        lo, hi = min(usd), max(usd)
        if hi == lo:
            hi = lo + 1
        width = (hi - lo) / buckets
        counts = [0] * buckets
        for v in usd:
            idx = min(int((v - lo) / width), buckets - 1)
            counts[idx] += 1
        result = []
        for i, c in enumerate(counts):
            b_lo = lo + i * width
            b_hi = b_lo + width
            result.append(
                HistogramBucket(
                    label=f"${b_lo/1000:.0f}k-${b_hi/1000:.0f}k",
                    min_usd=round(b_lo, 2),
                    max_usd=round(b_hi, 2),
                    count=c,
                )
            )
        return result

    def top_paid(self, limit: int = 10, ascending: bool = False) -> list[EmployeeBrief]:
        rows = self.repo.all()
        enriched = [
            (e, to_usd(float(e.salary), e.currency)) for e in rows
        ]
        enriched.sort(key=lambda t: t[1], reverse=not ascending)
        return [
            EmployeeBrief(
                employee_id=e.employee_id,
                name=f"{e.first_name} {e.last_name}",
                department=e.department,
                country=e.country,
                designation=e.designation,
                salary=float(e.salary),
                currency=e.currency,
                salary_usd=round(usd, 2),
            )
            for e, usd in enriched[:limit]
        ]
