const { CartModel } = require('../models/cartModel');
let cartModel;

exports.init = (cartCollection) => {
    cartModel = new CartModel(cartCollection);
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        let cart = await cartModel.getByUserId(userId);
        if (!cart) cart = await cartModel.create(userId);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération du panier' });
    }
};

exports.addItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        let cart = await cartModel.getByUserId(userId);
        if (!cart) cart = await cartModel.create(userId);

        const existing = cart.items.find(i => i.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cartModel.updateItems(userId, cart.items);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'ajout au panier" });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        let cart = await cartModel.getByUserId(userId);
        if (!cart) return res.status(404).json({ message: "Panier non trouvé" });

        const item = cart.items.find(i => i.productId === productId);
        if (!item) return res.status(404).json({ message: "Produit non trouvé dans le panier" });

        item.quantity = quantity;
        await cartModel.updateItems(userId, cart.items);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la modification du panier" });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;
        let cart = await cartModel.getByUserId(userId);
        if (!cart) return res.status(404).json({ message: "Panier non trouvé" });

        cart.items = cart.items.filter(i => i.productId !== productId);
        await cartModel.updateItems(userId, cart.items);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la suppression du produit du panier" });
    }
};

exports.emptyCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        await cartModel.emptyCart(userId);
        res.json({ message: "Panier vidé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du vidage du panier" });
    }
};