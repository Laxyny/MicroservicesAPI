from bson import ObjectId
import datetime


async def get_store_stats(db, magasins_db, report):
    try:
        store_id = ObjectId(report.storeId)
    except Exception:
        return None

    store = await magasins_db.Stores.find_one({"_id": store_id})
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
        "sales": sales[0]["total"] if sales else 0,
    }


async def get_product_stats(products_db, orders_db, categories_db, report):
    try:
        store_id = str(report.storeId)
    except Exception:
        print("StoreId non convertible en str")
        return []

    cursor = products_db.Product.find({"storeId": store_id})
    products = await cursor.to_list(None)
    print(f"Produits récupérés pour {store_id} : {len(products)}")

    product_ids = [p["_id"] for p in products]
    product_id_str_map = {str(p["_id"]): p for p in products}

    category_ids = [
        ObjectId(p["categoryId"])
        for p in products
        if "categoryId" in p and ObjectId.is_valid(p["categoryId"])
    ]
    categories = await categories_db["Category"].find({"_id": {"$in": category_ids}}).to_list(None)
    category_map = {str(c["_id"]): c["name"] for c in categories}

    sales_stats = {}
    for product in products:
        product_id_str = str(product["_id"])
        sales_stats[product_id_str] = {
            "name": product.get("name", "Inconnu"),
            "price": product.get("price", 0),
            "categoryId": product.get("categoryId", ""),
            "quantity_sold": 0,
            "total_sales": 0,
        }

    orders = await orders_db.Orders.find({}).to_list(None)

    for order in orders:
        if "items" not in order:
            continue

        for item in order["items"]:
            product_id = item.get("productId", None)
            if not product_id or product_id not in sales_stats:
                continue

            quantity = item.get("quantity", 0)
            price = item.get("price", 0)

            sales_stats[product_id]["quantity_sold"] += quantity
            sales_stats[product_id]["total_sales"] += quantity * price

    result = []
    for product_id, stats in sales_stats.items():
        cat_id = stats["categoryId"]
        stats["category"] = category_map.get(cat_id, "Non spécifiée")
        result.append(stats)

    return sorted(result, key=lambda x: x["total_sales"], reverse=True)


async def get_order_details(db, order_id):
    try:
        order = await db.Orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            return None

        order["_id"] = str(order["_id"])

        if isinstance(order["date"], str):
            order["date"] = datetime.datetime.fromisoformat(
                order["date"].replace("Z", "+00:00")
            )

        subtotal = sum(item["price"] * item["quantity"] for item in order["items"])
        shipping = order["total"] - subtotal

        return {"order": order, "subtotal": subtotal, "shipping": shipping}
    except Exception as e:
        print(f"Erreur lors de la récupération de la commande: {e}")
        return None
