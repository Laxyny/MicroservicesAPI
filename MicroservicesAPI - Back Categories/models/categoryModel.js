const { ObjectId } = require('mongodb');

class CategoryModel {
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

    async create(newCategory) {
        const categoryToInsert = {
            ...newCategory,
        };

        const result = await this.collection.insertOne(categoryToInsert);
        return { _id: result.insertedId, ...categoryToInsert };
    }

    async updateById(id, updatedFields) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updatedFields } }
        );
        return result.matchedCount > 0;
    }

    async deleteById(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = { CategoryModel };
