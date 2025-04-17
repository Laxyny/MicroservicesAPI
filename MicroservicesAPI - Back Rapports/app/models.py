from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReportIn(BaseModel):
    storeId: str
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    includeProducts: bool = True
    includeCharts: bool = True
    locale: str = Field(default="fr", pattern="^(fr|en)$")


class ReportOut(BaseModel):
    id: str
    storeId: str
    filters: dict
    size: int
    createdAt: datetime
