const { RatingModel } = require('../models/ratingModel');
const { ObjectId } = require('mongodb');
const axios = require('axios');

let ratingModel;
let orderModel;
let productModel;
let storeModel;
let userModel;

exports.init = (ratingCollection, orderCollection, productColl, storeColl, userColl) => {
    ratingModel = new RatingModel(ratingCollection);
    orderModel = orderCollection;
    productModel = productColl;
    storeModel = storeColl;
    userModel = userColl;
};

const hasUserPurchasedProduct = async (userId, productId) => {
    try {
        const orders = await orderModel.find({
            userId: userId,
            status: 'Complétée',
            'items.productId': productId
        }).toArray();

        return orders.length > 0;
    } catch (err) {
        console.error("Erreur lors de la vérification d'achat:", err);
        return false;
    }
};

exports.createRating = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.userId;

        if (!productId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Données de notation invalides' });
        }

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Un commentaire est obligatoire' });
        }

        const hasPurchased = await hasUserPurchasedProduct(userId, productId);
        if (!hasPurchased) {
            return res.status(403).json({
                message: 'Vous devez avoir acheté ce produit pour pouvoir le noter'
            });
        }

        const existingRating = await ratingModel.getByUserAndProduct(userId, productId);
        if (existingRating) {
            const updated = await ratingModel.updateById(existingRating._id, {
                rating: rating,
                comment: comment,
                updatedAt: new Date()
            });

            if (updated) {
                return res.json({ message: 'Note et commentaire mis à jour avec succès' });
            } else {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
            }
        }

        const newRating = {
            userId,
            productId,
            rating,
            comment,
            createdAt: new Date()
        };

        const createdRating = await ratingModel.create(newRating);

        const product = await productModel.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        const store = await storeModel.findOne({ _id: new ObjectId(product.storeId) });
        if (!store) {
            return res.status(404).json({ message: 'Boutique non trouvée' });
        }

        const user = await userModel.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const userName = user.name;

        try {

            await axios.post('http://ms_notifications:8000/notifications/notify', {
                userId: store.userId,
                type: 'new_review',
                data: {
                    productId,
                    productName: product.name,
                    rating,
                    comment,
                    userName
                }
            });
        } catch (err) {
            console.error("Erreur lors de l'envoi de la notification:", err);
        }

        res.status(201).json(createdRating);
    } catch (err) {
        console.error("Erreur lors de la création de la note:", err);
        res.status(500).json({ message: 'Erreur lors de la création de la note' });
    }
};

exports.getProductRatings = async (req, res) => {
    try {
        const productId = req.params.productId;
        const ratings = await ratingModel.getByProductId(productId);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
    }
};

exports.getAverageRating = async (req, res) => {
    try {
        const productId = req.params.productId;
        const average = await ratingModel.getAverageRating(productId);
        res.json(average);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du calcul de la note moyenne' });
    }
};

exports.getUserRating = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.userId;
        const rating = await ratingModel.getByUserAndProduct(userId, productId);

        if (rating) {
            res.json(rating);
        } else {
            res.status(404).json({ message: 'Aucune note trouvée pour cet utilisateur et ce produit' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la note' });
    }
};

exports.deleteRating = async (req, res) => {
    try {
        const id = req.params.id;
        const rating = await ratingModel.getById(id);

        if (!rating) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        if (rating.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Vous ne pouvez pas supprimer cette note' });
        }

        const success = await ratingModel.deleteById(id);

        if (success) {
            res.json({ message: 'Note supprimée avec succès' });
        } else {
            res.status(500).json({ message: 'Erreur lors de la suppression de la note' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la note' });
    }
};