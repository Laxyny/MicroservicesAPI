from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.auth import verify_token
from app.models import ReportIn, ReportOut, ReportSchedule
from app.pdf import build_invoice_pdf, build_pdf
import os, io, datetime, bson
import httpx
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from app.models import InvoiceIn, InvoiceOut
from app.scheduler import ReportScheduler
from typing import List
from app.models import ReportHistoryItem

app = FastAPI()
client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client.get_default_database()
fs = AsyncIOMotorGridFSBucket(db, bucket_name="reports_pdf")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Gestion des rapports pour les boutiques
# @app.post("/reports/generate", response_model=ReportOut)
# async def generate(report: ReportIn, user_id=Depends(verify_token)):
#     pdf_bytes = await build_pdf(db, report)
#     file_id = await fs.upload_from_stream(
#         f"{report.storeId}_{datetime.datetime.now().isoformat()}.pdf",
#         io.BytesIO(pdf_bytes),
#     )
#     meta = {
#         "storeId": report.storeId,
#         "filters": report.dict(exclude={"storeId"}),
#         "size": len(pdf_bytes),
#         "createdAt": datetime.datetime.now().isoformat(),
#     }
#     res = await db.Reports.insert_one({**meta, "fileId": file_id})
#     return {"id": str(res.inserted_id), **meta}


@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "UP"}, status_code=200)


@app.get("/reports/{id}")
async def download(id: str, user_id=Depends(verify_token)):
    doc = await db.Reports.find_one({"_id": bson.ObjectId(id)})
    if not doc:
        raise HTTPException(404)
    grid_out = await fs.open_download_stream(doc["fileId"])
    return StreamingResponse(
        grid_out,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{id}.pdf"'},
    )


# Gestion des factures lors des commandes
@app.post("/reports/generate", response_model=ReportOut)
async def generate(report: ReportIn, user_id=Depends(verify_token)):
    pdf_bytes = await build_pdf(db, report)
    file_id = await fs.upload_from_stream(
        f"{report.storeId}_{datetime.datetime.now().isoformat()}.pdf",
        io.BytesIO(pdf_bytes),
    )

    meta = {
        "storeId": report.storeId,
        "filters": report.dict(exclude={"storeId"}),
        "size": len(pdf_bytes),
        "createdAt": datetime.datetime.now().isoformat(),
    }

    res = await db.Reports.insert_one({**meta, "fileId": file_id})
    report_id = str(res.inserted_id)

    await db.ReportHistory.insert_one(
        {
            "storeId": report.storeId,
            "reportId": report_id,
            "generatedAt": datetime.datetime.now(),
            "type": "manual",
        }
    )

    store = await db.Stores.find_one({"_id": ObjectId(report.storeId)})
    store_name = store.get("name") if store else None

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                "http://ms_notifications:8000/notifications/notify",
                json={
                    "userId": user_id,
                    "type": "report_ready",
                    "data": {
                        "reportId": report_id,
                        "storeId": report.storeId,
                        "storeName": store_name,
                    },
                },
            )
    except Exception as notif_err:
        print("Erreur notification rapport:", notif_err)

    return {"id": report_id, **meta}


@app.post("/invoices/generate", response_model=InvoiceOut)
async def generate_invoice(invoice: InvoiceIn, user_id=Depends(verify_token)):
    pdf_bytes = await build_invoice_pdf(db, invoice)
    if not pdf_bytes:
        raise HTTPException(404, "Commande non trouvée")

    file_id = await fs.upload_from_stream(
        f"facture_{invoice.orderId}_{datetime.datetime.now().isoformat()}.pdf",
        io.BytesIO(pdf_bytes),
    )

    created_at = datetime.datetime.now().isoformat()
    
    meta = {
        "orderId": invoice.orderId,
        "fileId": file_id,
        "createdAt": created_at,
        "userId": user_id,
        "size": len(pdf_bytes)
    }

    result = await db.Invoices.insert_one(meta)
    return {
        "id": str(result.inserted_id),
        "orderId": invoice.orderId,
        "size": len(pdf_bytes),
        "createdAt": created_at
    }


@app.get("/invoices/{id}")
async def download_invoice(id: str, user_id=Depends(verify_token)):
    doc = await db.Invoices.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404)
    grid_out = await fs.open_download_stream(doc["fileId"])
    return StreamingResponse(
        grid_out,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="facture_{doc["orderId"]}.pdf"'
        },
    )


@app.post("/reports/schedule", response_model=ReportSchedule)
async def create_schedule(schedule: ReportSchedule, user_id=Depends(verify_token)):
    try:
        print(f"Données reçues pour schedule: {schedule.dict()}")

        if hasattr(schedule, "dayOfWeek") and schedule.dayOfWeek is not None:
            schedule.dayOfWeek = int(schedule.dayOfWeek)
        if hasattr(schedule, "dayOfMonth") and schedule.dayOfMonth is not None:
            schedule.dayOfMonth = int(schedule.dayOfMonth)

        store = await db.Stores.find_one({"_id": ObjectId(schedule.storeId)})
        if not store or str(store.get("userId")) != user_id:
            raise HTTPException(403, "Vous n'avez pas accès à cette boutique")

        await db.ReportSchedules.delete_many({"storeId": schedule.storeId})

        schedule_dict = schedule.dict(exclude_none=True)
        print(f"Données à insérer dans la BD: {schedule_dict}")

        res = await db.ReportSchedules.insert_one(schedule_dict)
        return {**schedule_dict, "id": str(res.inserted_id)}
    except Exception as e:
        print(f"Erreur lors de la création du schedule: {e}")
        raise HTTPException(
            500, f"Erreur lors de l'enregistrement des préférences: {str(e)}"
        )


@app.get("/reports/schedule/{store_id}", response_model=ReportSchedule)
async def get_schedule(store_id: str, user_id=Depends(verify_token)):
    schedule = await db.ReportSchedules.find_one({"storeId": store_id})
    if not schedule:
        return {"storeId": store_id, "frequency": "never"}
    return schedule


@app.get(
    "/reports/history/{store_id}",
    response_model=List[ReportHistoryItem],
)
async def get_report_history(store_id: str, user_id=Depends(verify_token)):
    store = await db.Stores.find_one({"_id": ObjectId(store_id)})
    if not store or str(store.get("userId")) != user_id:
        raise HTTPException(403, "Vous n'avez pas accès à cette boutique")

    raw = await (
        db.ReportHistory.find({"storeId": store_id}).sort("generatedAt", -1).to_list(50)
    )

    return [
        {
            "id": str(item["_id"]),
            "storeId": item["storeId"],
            "reportId": item["reportId"],
            "generatedAt": item["generatedAt"],
            "type": item.get("type", "scheduled"),
        }
        for item in raw
    ]


scheduler = ReportScheduler(db, fs)


@app.on_event("startup")
async def startup_scheduler():
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.stop()
