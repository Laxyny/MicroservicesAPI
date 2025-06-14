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
    
# Gestion rapports auto
class ReportSchedule(BaseModel):
    storeId: str
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|never)$")
    dayOfWeek: Optional[int] = Field(None, ge=0, lt=7)
    dayOfMonth: Optional[int] = Field(None, ge=1, le=31)
    includeProducts: bool = True
    includeCharts: bool = True
    emailEnabled: bool = True
    emailAddress: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    lastSent: Optional[datetime] = None
    
class ReportHistoryItem(BaseModel):
    id: str  
    storeId: str
    reportId: str
    generatedAt: datetime
    type: str = "scheduled"