const { ObjectId } = require('mongodb');

class OrderModel {
    constructor(collection) {
        this.collection = collection;
    }

    async getAll() {
        return await this.collection.find({}).toArray();
    }

    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByUserId(userId) {
        return await this.collection.find({ userId: userId }).toArray();
    }

    async create(newOrder) {
        const orderToInsert = {
            ...newOrder,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.collection.insertOne(orderToInsert);
        return { _id: result.insertedId, ...orderToInsert };
    }

    async updateById(id, updatedFields) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updatedFields,
                    updatedAt: new Date()
                }
            }
        );
        return result.modifiedCount > 0;
    }

    async updateStatus(id, status) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    updatedAt: new Date()
                }
            }
        );
        return result.modifiedCount > 0;
    }

    async deleteById(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = { OrderModel };