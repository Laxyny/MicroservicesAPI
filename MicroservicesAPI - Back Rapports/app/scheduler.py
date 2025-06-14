import asyncio
import aioschedule as schedule
from datetime import datetime, timedelta
from bson import ObjectId
from app.pdf import build_pdf
from app.models import ReportIn
import time
import io

class ReportScheduler:
    def __init__(self, db, fs, mailer=None):
        self.db = db
        self.fs = fs
        self.mailer = mailer
        self.running = False

    async def generate_scheduled_report(self, schedule_item):
        try:
            store_id = schedule_item["storeId"]
            store = await self.db.Stores.find_one({"_id": ObjectId(store_id)})
            
            if not store:
                print(f"Boutique non trouvée: {store_id}")
                return
                
            report = ReportIn(
                storeId=store_id,
                includeProducts=schedule_item.get("includeProducts", True),
                includeCharts=schedule_item.get("includeCharts", True)
            )
            
            pdf_bytes = await build_pdf(self.db, report)
            
            file_id = await self.fs.upload_from_stream(
                f"{store_id}_{datetime.now().isoformat()}.pdf",
                io.BytesIO(pdf_bytes),
            )
            
            meta = {
                "storeId": store_id,
                "filters": report.dict(exclude={"storeId"}),
                "size": len(pdf_bytes),
                "createdAt": datetime.now().isoformat(),
            }
            
            res = await self.db.Reports.insert_one({**meta, "fileId": file_id})
            report_id = str(res.inserted_id)
            
            await self.db.ReportHistory.insert_one({
                "storeId": store_id,
                "reportId": report_id,
                "generatedAt": datetime.now(),
                "type": "scheduled"
            })
            
            await self.db.ReportSchedules.update_one(
                {"storeId": store_id},
                {"$set": {"lastSent": datetime.now().isoformat()}}
            )
                        
            print(f"Rapport généré pour {store_id}: {report_id}")
            
        except Exception as e:
            print(f"Erreur lors de la génération du rapport: {e}")

    async def check_daily_reports(self):
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        query = {
            "frequency": "daily",
            "$or": [
                {"lastSent": {"$lt": (today - timedelta(hours=20)).isoformat()}},
                {"lastSent": None}
            ]
        }
        
        schedules = await self.db.ReportSchedules.find(query).to_list(None)
        for schedule in schedules:
            await self.generate_scheduled_report(schedule)

    async def check_weekly_reports(self):
        weekday = datetime.now().weekday()
        query = {
            "frequency": "weekly",
            "dayOfWeek": weekday
        }
        
        schedules = await self.db.ReportSchedules.find(query).to_list(None)
        for schedule in schedules:
            last_sent = schedule.get("lastSent")
            if last_sent:
                last_sent_date = datetime.fromisoformat(last_sent.replace("Z", "+00:00"))
                if (datetime.now() - last_sent_date).days < 6:
                    continue
                    
            await self.generate_scheduled_report(schedule)

    async def check_monthly_reports(self):
        day = datetime.now().day
        query = {
            "frequency": "monthly",
            "dayOfMonth": day
        }
        
        schedules = await self.db.ReportSchedules.find(query).to_list(None)
        for schedule in schedules:
            last_sent = schedule.get("lastSent")
            if last_sent:
                last_sent_date = datetime.fromisoformat(last_sent.replace("Z", "+00:00"))
                if (datetime.now() - last_sent_date).days < 25:
                    continue
                    
            await self.generate_scheduled_report(schedule)

    async def run_scheduler(self):
        self.running = True
        
        schedule.every().day.at("03:00").do(self.check_daily_reports)
        schedule.every().day.at("04:00").do(self.check_weekly_reports)
        schedule.every().day.at("05:00").do(self.check_monthly_reports)
        
        while self.running:
            await schedule.run_pending()
            await asyncio.sleep(60)

    def start(self):
        asyncio.create_task(self.run_scheduler())

    def stop(self):
        self.running = False