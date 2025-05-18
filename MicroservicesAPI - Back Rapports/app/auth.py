import fastapi, datetime, bson, os, base64, json
from fastapi import Cookie
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client.get_default_database()

async def verify_token(authToken: str = Cookie(...)):
    try:
        decoded = base64.b64decode(authToken).decode("utf-8")
        token_data = json.loads(decoded)
        token_id = token_data["tokenId"]
    except Exception as e:
        print("Erreur cookie authToken:", e)
        raise fastapi.HTTPException(status_code=401, detail="Token invalide")

    try:
        doc = await db.Tokens.find_one({"_id": bson.ObjectId(token_id)})
    except bson.errors.InvalidId:
        raise fastapi.HTTPException(401, detail="Token invalide")
    
    if not doc or doc["expiresIn"] < int(datetime.datetime.utcnow().timestamp()):
        raise fastapi.HTTPException(401, detail="Token expiré")
    
    return doc["userId"]
