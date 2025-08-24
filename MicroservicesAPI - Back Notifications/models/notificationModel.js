const { ObjectId } = require('mongodb');

class NotificationModel {
    constructor(collection) {
        this.collection = collection;
    }

    async create(notification) {
        const now = new Date();
        const newNotification = {
            ...notification,
            createdAt: now,
            read: false
        };

        const result = await this.collection.insertOne(newNotification);
        return { ...newNotification, _id: result.insertedId };
    }

    async getByUserId(userId, limit = 50) {
        return await this.collection
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
    }

    async markAsRead(id) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true } }
        );
        return result.modifiedCount > 0;
    }

    async delete(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    async getUnreadCount(userId) {
        return await this.collection.countDocuments({ userId, read: false });
    }
}

module.exports = { NotificationModel };