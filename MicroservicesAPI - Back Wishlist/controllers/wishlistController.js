const { WishlistModel } = require('../models/wishlistModel');

exports.getWishlist = async (req, res) => {
  const userId = req.user.id;
  const wishlist = await WishlistModel.getByUser(userId);
  res.json(wishlist);
};

exports.addToWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;
  await WishlistModel.add(userId, productId);
  res.json({ message: 'Product added to wishlist' });
};

exports.removeFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  await WishlistModel.remove(userId, productId);
  res.json({ message: 'Product removed from wishlist' });
};
