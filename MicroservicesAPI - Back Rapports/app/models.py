from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Gestion des rapports pour les boutiques
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

# Gestion des factures
class InvoiceIn(BaseModel):
    orderId: str
    locale: str = Field(default="fr", pattern="^(fr|en)$")

class InvoiceOut(BaseModel):
    id: str
    orderId: str
    size: int
    createdAt: str