async def get_store_stats(db, report):
    store = await db.Stores.find_one({"_id": report.storeId})
    sales = await db.Product.aggregate(
        [
            {"$match": {"storeId": report.storeId}},
            {"$group": {"_id": None, "total": {"$sum": "$price"}}},
        ]
    ).to_list(None)
    return {"store": store, "sales": sales[0]["total"] if sales else 0}


async def get_product_stats(db, report):
    cursor = db.Product.find({"storeId": report.storeId})
    return await cursor.to_list(None)
