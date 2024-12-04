const { ObjectId } = require('mongodb');

class StoreModel {
    constructor(collection) {
        this.collection = collection;
    }

    async getAll() {
        return await this.collection.find({}).toArray();
    }

    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByName(name){
        return await this.collection.findone({ name: name});
    }

    async create(newStore) {
        const storeToInsert = {
            ...newStore,
            createdAt: new Date(),
        };

        const result = await this.collection.insertOne(storeToInsert);
        return { _id: result.insertedId, ...storeToInsert };
    }

    async updateById(id, updatedFields) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updatedFields, updatedAt: new Date() } }
        );
        return result.matchedCount > 0;
    }

    async deleteById(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = { StoreModel };
