const { ObjectId } = require('mongodb');

class TokenModel {
    constructor(collection) {
        this.collection = collection;
    }

    async create(tokenData) {
        const result = await this.collection.insertOne(tokenData);
        return { _id: result.insertedId, ...tokenData };
    }

    async findByUserId(userId) {
        return await this.collection.findOne({ userId: new ObjectId(userId) });
    }
}

module.exports = TokenModel;
