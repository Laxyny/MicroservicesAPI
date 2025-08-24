const { CategoryModel } = require('../models/categoryModel');
const axios = require('axios');

let categoryModel;

exports.init = (productCollection) => {
    categoryModel = new CategoryModel(productCollection);
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.getAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await categoryModel.getById(id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Catégorie non trouvé' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la catégorie' });
    }
};

exports.getProductCategories = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const categories = await categoryModel.getByProductId(storeId);
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "Aucune catégorie trouvée pour cet utilisateur." });
        }
        res.json(categories);
    } catch (err) {
        console.error("Erreur lors de la récupération des catégories :", err);

        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.createCategory = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const { name, description, price, categoryId, image, storeId } = req.body;

        const response = await axios.get('http://ms_users:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'seller') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent créer un catégorie" });
        }

        if (!name) {
            return res.status(400).json({ message: "Le nom de la catégorie est requis" });
        }

        const newCategory = {
            name: name,
        };

        const createdCategory = await categoryModel.create(newCategory);
        res.status(201).json(createdCategory);
    } catch (err) {
        console.error("Erreur lors de la création de la catégorie :", err);
        res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedFields = {
            name: req.body.name
        };
        const success = await categoryModel.updateById(id, updatedFields);
        if (!success) {
            res.status(404).json({ message: 'Catégorie non trouvé' });
        } else {
            res.json({ message: 'Catégorie mis à jour' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await categoryModel.deleteById(id);
        if (!success) {
            res.status(404).json({ message: 'Catégorie non trouvé' });
        } else {
            res.status(200).json({ message: 'Catégorie supprimé' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
    }
};
