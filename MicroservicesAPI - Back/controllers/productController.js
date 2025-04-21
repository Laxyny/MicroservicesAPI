const { ProductModel } = require('../models/productModel');
const axios = require('axios');

let productModel;

exports.init = (productCollection) => {
    productModel = new ProductModel(productCollection);
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.getById(id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
    }
};

exports.getUserProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        const product = await productModel.collection.findOne({ userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur." });
        }

        res.json(product);
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.getUserProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        const product = await productModel.collection.findOne({ userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur." });
        }

        res.json(product);
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.getUserProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        const product = await productModel.collection.findOne({ userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur." });
        }

        res.json(product);
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.getUserProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        const product = await productModel.collection.findOne({ userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur." });
        }

        res.json(product);
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.getStoreProducts = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const products = await productModel.getByStoreId(storeId);
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Aucun produit trouvée pour cet utilisateur." });
        }

        res.json(products);
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.createProduct = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const { name, description, price, categoryId, image, storeId } = req.body;

        const userId = req.user.userId;

        const response = await axios.get('http://localhost:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'seller') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent créer un produit" });
        }

        const existingProduct = await productModel.getByNameAndOwner(name, userId);
        if (existingProduct) {
            return res.status(400).json({ message: 'Vous avez déjà créé ce produit' });
        }

        if (!name) {
            return res.status(400).json({ message: "Le nom de la produit est requis" });
        }

        const newProduct = {
            name: name,
            description: description,
            price: price,
            categoryId: categoryId,
            image: image,
            storeId: storeId
        };

        const createdProduct = await productModel.create(newProduct);
        res.status(201).json(createdProduct);
    } catch (err) {
        console.error("Erreur lors de la création du produit :", err);
        res.status(500).json({ message: "Erreur lors de la création du produit" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedFields = {
            name: req.body.name
        };
        const success = await productModel.updateById(id, updatedFields);
        if (!success) {
            res.status(404).json({ message: 'Produit non trouvé' });
        } else {
            res.json({ message: 'Produit mis à jour' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await productModel.deleteById(id);
        if (!success) {
            res.status(404).json({ message: 'Produit non trouvé' });
        } else {
            res.status(200).json({ message: 'Produit supprimé' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
    }
};

exports.getProductImages = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.getById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json({ image: product.image });
    }
    catch (err) {
        console.error("Erreur lors de la récupération de l\'image du produit :", err);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'image du produit' });
    }
}