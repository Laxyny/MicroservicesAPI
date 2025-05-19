import fastapi, datetime, os, base64, json, urllib.parse
from fastapi import Cookie, Request
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client.get_default_database()


def fix_base64(token: str) -> str:
    url_decoded = urllib.parse.unquote(token)
    padded = url_decoded + "=" * (-len(url_decoded) % 4)
    return base64.b64decode(padded).decode("utf-8")


async def verify_token(request: Request, authToken: str = Cookie(None)):
    if request.method == "OPTIONS":
        return None

    if not authToken:
        raise fastapi.HTTPException(status_code=401, detail="Token inexistant")

    try:
        decoded = fix_base64(authToken)
        token_data = json.loads(decoded)
        user_id = token_data.get("userId")
        if not user_id:
            raise ValueError("Champ userId manquat")
    except Exception as e:
        print("Erreur cookie authToken:", e)
        raise fastapi.HTTPException(status_code=401, detail="Token invalide")

    current_time = int(datetime.datetime.utcnow().timestamp())
    doc = await db.Tokens.find_one(
        {"userId": user_id, "expiresIn": {"$gt": current_time}}
    )

    if not doc or doc["expiresIn"] < int(datetime.datetime.utcnow().timestamp()):
        raise fastapi.HTTPException(401, detail="Token expiré")

    return doc["userId"]
