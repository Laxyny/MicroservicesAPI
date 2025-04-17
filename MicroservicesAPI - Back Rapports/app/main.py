from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.auth import verify_token
from app.models import ReportIn, ReportOut
from app.pdf import build_pdf
import os, io, datetime, bson

app = FastAPI()
client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client.get_default_database()
fs = AsyncIOMotorGridFSBucket(db, bucket_name="reports_pdf")


@app.post("/reports/generate", response_model=ReportOut)
async def generate(report: ReportIn, user_id=Depends(verify_token)):
    pdf_bytes = await build_pdf(db, report)
    file_id = await fs.upload_from_stream(
        f"{report.storeId}_{datetime.datetime.utcnow().isoformat()}.pdf",
        io.BytesIO(pdf_bytes),
    )
    meta = {
        "storeId": report.storeId,
        "filters": report.dict(exclude={"storeId"}),
        "size": len(pdf_bytes),
        "createdAt": datetime.datetime.utcnow().isoformat(),
    }
    res = await db.Reports.insert_one({**meta, "fileId": file_id})
    return {"id": str(res.inserted_id), **meta}


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
