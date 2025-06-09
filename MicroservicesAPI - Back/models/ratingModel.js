class RatingModel {
    constructor(collection) {
        this.collection = collection;
    }

    async create(rating) {
        const result = await this.collection.insertOne(rating);
        return { ...rating, _id: result.insertedId };
    }

    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByProductId(productId) {
        return await this.collection.find({ productId: productId }).toArray();
    }

    async getByUserAndProduct(userId, productId) {
        return await this.collection.findOne({ userId: userId, productId: productId });
    }

    async updateById(id, updatedFields) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedFields }
        );
        return result.modifiedCount > 0;
    }

    async deleteById(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    async getAverageRating(productId) {
        const result = await this.collection.aggregate([
            { $match: { productId: productId } },
            { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]).toArray();
        
        if (result.length > 0) {
            return {
                average: result[0].averageRating,
                count: result[0].count
            };
        }
        return { average: 0, count: 0 };
    }
}

module.exports = { RatingModel };