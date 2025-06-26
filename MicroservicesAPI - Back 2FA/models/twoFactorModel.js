const { ObjectId } = require('mongodb');

class TwoFactorModel {
    constructor(collection) {
        this.collection = collection;
    }

    async getByUserId(userId) {
        return await this.collection.findOne({ userId });
    }

    async create(data) {
        const result = await this.collection.insertOne(data);
        return { _id: result.insertedId, ...data };
    }

    async update(userId, data) {
        const result = await this.collection.updateOne(
            { userId },
            { $set: data },
            { upsert: true }
        );
        return result.modifiedCount > 0 || result.upsertedCount > 0;
    }

    async verify(userId) {
        const result = await this.collection.updateOne(
            { userId },
            { $set: { verified: true } }
        );
        return result.modifiedCount > 0;
    }

    async delete(userId) {
        const result = await this.collection.deleteOne({ userId });
        return result.deletedCount > 0;
    }
}

module.exports = { TwoFactorModel };