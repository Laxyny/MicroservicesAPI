const axios = require('axios');

//Catégories Controller

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await axios.get('http://ms_back:3000/category/listCategories');
        res.json(categories.data);
    } catch (err) {
        console.error('Erreur recupération categ:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await axios.get(`http://ms_back:3000/category/category/${id}`);
        if (category.data) {
            res.json(category.data);
        } else {
            res.status(404).json({ message: 'Catégorie non trouvée' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la catégorie' });
    }
}

exports.getProductCategories = async (req, res) => {
    try {
        const productId = req.params.productId;
        const categories = await axios.get(`http://ms_back:3000/category/categories/${productId}`);
        if (!categories.data || categories.data.length === 0) {
            return res.status(404).json({ message: "Aucune catégorie trouvée pour ce produit." });
        }
        res.json(categories.data);
    } catch (err) {
        console.error("Erreur lors de la récupération des catégories :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.updateCategory = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;
        const { name, description } = req.body;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent mettre à jour une catégorie" });
        }

        const updatedCategory = await axios.put(`http://ms_back:3000/category/updateCategory/${id}`, {
            name,
            description
        });

        res.json(updatedCategory.data);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la catégorie :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.deleteCategory = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent supprimer une catégorie" });
        }

        await axios.delete(`http://ms_back:3000/category/deleteCategory/${id}`);
        res.json({ message: 'Catégorie supprimée' });
    } catch (err) {
        console.error("Erreur lors de la suppression de la catégorie :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

//Poduit Controller

exports.getAllProducts = async (req, res) => {
    try {
        const products = await axios.get('http://ms_back:3000/product/listProducts');
        res.json(products.data);
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await axios.get(`http://ms_back:3000/product/product/${id}`);
        if (product.data) {
            res.json(product.data);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.getStoreProducts = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const products = await axios.get(`http://ms_back:3000/product/products/${storeId}`);
        if (!products.data || products.data.length === 0) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cette boutique." });
        }
        res.json(products.data);
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.deleteProduct = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent supprimer un produit" });
        }

        await axios.delete(`http://ms_back:3000/product/deleteProduct/${id}`);
        res.json({ message: 'Produit supprimé' });
    } catch (err) {
        console.error("Erreur lors de la suppression du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.updateProduct = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;
        const { name, description, price, categoryId, image, storeId, customFields } = req.body;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent mettre à jour un produit" });
        }

        const updatedProduct = await axios.put(`http://ms_back:3000/product/updateProduct/${id}`, {
            name,
            description,
            price,
            categoryId,
            image,
            storeId,
            customFields
        });

        res.json(updatedProduct.data);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du produit :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

//Store Controller

exports.getAllStores = async (req, res) => {
    try {
        const stores = await axios.get('http://ms_back:3000/seller/listStores');
        res.json(stores.data);
    } catch (err) {
        console.error("Erreur lors de la récupération des magasins :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.getStore = async (req, res) => {
    try {
        const id = req.params.id;
        const store = await axios.get(`http://ms_back:3000/seller/store/${id}`);
        if (store.data) {
            res.json(store.data);
        } else {
            res.status(404).json({ message: 'Magasin non trouvé' });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération du magasin :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.updateStore = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;
        const { name, description, site, logo } = req.body;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les administrateurs peuvent mettre à jour un magasin" });
        }

        const updatedStore = await axios.put(`http://ms_back:3000/seller/updateStore/${id}`, {
            name,
            description,
            site,
            logo
        });

        res.json(updatedStore.data);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du magasin :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

exports.deleteStore = async (req, res) => {
    const token = req.cookies.authToken;
    try {
        const id = req.params.id;

        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé : Seuls les administrateurs peuvent supprimer un magasin" });
        }

        await axios.delete(`http://ms_back:3000/seller/deleteStore/${id}`);
        res.json({ message: 'Magasin supprimé' });
    } catch (err) {
        console.error("Erreur lors de la suppression du magasin :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}