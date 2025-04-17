import fastapi, datetime, bson, os
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client.get_default_database()

async def verify_token(header: str = fastapi.Header(..., alias="Authorization")):
    if not header.startswith("Bearer "):
        raise fastapi.HTTPException(401)
    token_id = header.split()[1]
    try:
        doc = await db.Tokens.find_one({"_id": bson.ObjectId(token_id)})
    except bson.errors.InvalidId:
        raise fastapi.HTTPException(401)
    if not doc or doc["expiresIn"] < int(datetime.datetime.utcnow().timestamp()):
        raise fastapi.HTTPException(401)
    return doc["userId"]
