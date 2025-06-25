const { ObjectId } = require('mongodb');

class CartModel {
    constructor(collection) {
        this.collection = collection;
    }

    async getAll() {
        return await this.collection.find({}).toArray();
    }

    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByName(name) {
        return await this.collection.findone({ name: name });
    }

    async getByCategoryId(id) {
        return await this.collection.find({ storeId: id }).toArray();
    }

    async getByProductId(id) {
        return await this.collection.find({ productId: id }).toArray();
    }

    async getByUserId(userId) {
        return await this.collection.findOne({ userId });
    }

    async create(userId) {
        const cartToInsert = {
            userId,
            items: []
        };
        const result = await this.collection.insertOne(cartToInsert);
        return { _id: result.insertedId, ...cartToInsert };
    }

    async updateItems(userId, items) {
        const result = await this.collection.updateOne(
            { userId },
            { $set: { items } }
        );
        return result.modifiedCount > 0;
    }

    async emptyCart(userId) {
        return await this.updateItems(userId, []);
    }
}

module.exports = { CartModel };