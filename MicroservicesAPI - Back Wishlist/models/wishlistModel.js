const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

const dbName = 'Wishlist';
const collectionName = 'Wishlist';

const WishlistModel = {
  async getByUser(userId) {
    await client.connect();
    const collection = client.db(dbName).collection(collectionName);
    return collection.find({ userId }).toArray();
  },
  async add(userId, productId) {
    await client.connect();
    const collection = client.db(dbName).collection(collectionName);
    return collection.insertOne({ userId, productId });
  },
  async remove(userId, productId) {
    await client.connect();
    const collection = client.db(dbName).collection(collectionName);
    return collection.deleteOne({ userId, productId });
  }
};

module.exports = { WishlistModel };
