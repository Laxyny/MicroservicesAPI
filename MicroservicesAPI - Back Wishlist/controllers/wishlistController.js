const { WishlistModel } = require('../models/wishlistModel');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId requis' });
    }

    const wishlistItems = await WishlistModel.getByUser(userId);
    const productIds = wishlistItems.map(item => item.productId);
    res.json(productIds);
  } catch (error) {
    console.error('Erreur getWishlist:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'userId et productId requis' });
    }

    await WishlistModel.add(userId, productId);
    res.status(201).json({ message: 'Produit ajouté à la wishlist' });
  } catch (error) {
    console.error('Erreur addToWishlist:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    const productId = req.query.productId || req.body.productId;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'userId et productId requis' });
    }

    await WishlistModel.remove(userId, productId);
    res.status(200).json({ message: 'Produit retiré de la wishlist' });
  } catch (error) {
    console.error('Erreur removeFromWishlist:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};