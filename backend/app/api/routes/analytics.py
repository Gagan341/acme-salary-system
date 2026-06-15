"""Analytics + HR insight endpoints (dashboard cards, charts, top lists)."""
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_analytics_service
from app.schemas.analytics import (
    EmployeeBrief,
    GroupStat,
    HistogramBucket,
    SummaryStats,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=SummaryStats)
def summary(svc: AnalyticsService = Depends(get_analytics_service)) -> SummaryStats:
    return svc.summary()


@router.get("/departments", response_model=list[GroupStat])
def by_department(svc: AnalyticsService = Depends(get_analytics_service)) -> list[GroupStat]:
    return svc.by_department()


@router.get("/countries", response_model=list[GroupStat])
def by_country(svc: AnalyticsService = Depends(get_analytics_service)) -> list[GroupStat]:
    return svc.by_country()


@router.get("/distribution", response_model=list[HistogramBucket])
def distribution(
    buckets: int = Query(8, ge=3, le=20),
    svc: AnalyticsService = Depends(get_analytics_service),
) -> list[HistogramBucket]:
    return svc.histogram(buckets)


@router.get("/top", response_model=list[EmployeeBrief])
def top_paid(
    limit: int = Query(10, ge=1, le=100),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    svc: AnalyticsService = Depends(get_analytics_service),
) -> list[EmployeeBrief]:
    """order=desc -> top paid; order=asc -> lowest paid."""
    return svc.top_paid(limit=limit, ascending=(order == "asc"))
