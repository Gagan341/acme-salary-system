"""Natural-language insight endpoint (rule-based interpreter)."""
from fastapi import APIRouter, Depends

from app.api.deps import get_insights_service
from app.schemas.analytics import InsightQuery, InsightResponse
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/query", response_model=InsightResponse)
def query(
    payload: InsightQuery, svc: InsightsService = Depends(get_insights_service)
) -> InsightResponse:
    return svc.query(payload.question)
