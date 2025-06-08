from bson import ObjectId
import datetime

async def get_store_stats(db, report):
    try:
        store_id = ObjectId(report.storeId)
    except Exception:
        return None

    store = await db.Stores.find_one({"_id": store_id})
    if not store:
        return None

    sales = await db.Product.aggregate(
        [
            {"$match": {"storeId": report.storeId}},
            {"$group": {"_id": None, "total": {"$sum": "$price"}}},
        ]
    ).to_list(None)

    return {
        "id": str(store["_id"]),
        "name": store.get("name"),
        "description": store.get("description"),
        "site": store.get("site"),
        "logo": store.get("logo"),
        "createdAt": store.get("createdAt"),
        "sales": sales[0]["total"] if sales else 0
    }

async def get_product_stats(db, report):
    try:
        store_id = str(report.storeId)
    except Exception:
        print("StoreId non convertible en str")
        return []

    cursor = db.Product.find({"storeId": store_id})
    products = await cursor.to_list(None)
    print(f"Produits récupérés pour {store_id} : {len(products)}")

    category_ids = [ObjectId(p["categoryId"]) for p in products if "categoryId" in p and ObjectId.is_valid(p["categoryId"])]
    categories = await db["Category"].find({"_id": {"$in": category_ids}}).to_list(None)
    category_map = {str(c["_id"]): c["name"] for c in categories}

    for product in products:
        cat_id = product.get("categoryId")
        product["category"] = category_map.get(cat_id, "Non spécifiée")

    return products

async def get_order_details(db, order_id):
    try:
        order = await db.Orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            return None
            
        order["_id"] = str(order["_id"])
        
        if isinstance(order["date"], str):
            order["date"] = datetime.datetime.fromisoformat(order["date"].replace('Z', '+00:00'))
        
        subtotal = sum(item["price"] * item["quantity"] for item in order["items"])
        shipping = order["total"] - subtotal
        
        return {
            "order": order,
            "subtotal": subtotal,
            "shipping": shipping
        }
    except Exception as e:
        print(f"Erreur lors de la récupération de la commande: {e}")
        return None