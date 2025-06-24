const { StoreModel } = require('../models/storeModel');
const axios = require('axios');

let storeModel;

exports.init = (storeCollection) => {
  storeModel = new StoreModel(storeCollection);
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await storeModel.getAll();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des magasins' });
  }
};

exports.getStore = async (req, res) => {
  try {
    const id = req.params.id;
    const store = await storeModel.getById(id);
    if (store) {
      res.json(store);
    } else {
      res.status(200).json({ message: 'Magasin non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération du magasin' });
  }
};

exports.getUserStore = async (req, res) => {
  try {
    const userId = req.user.userId;

    const store = await storeModel.collection.find({ userId: userId }).toArray();
    if (!store) {
      return res.status(200).json({ message: "Aucun magasin trouvé pour cet utilisateur." });
    }

    res.json(store);
  } catch (err) {
    console.error("Erreur lors de la récupération du magasin :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

exports.getUserStores = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stores = await storeModel.collection.find({ userId: userId }).toArray(); // Trouve toutes les boutiques
    if (!stores || stores.length === 0) {
      return res.status(200).json({ message: "Aucune boutique trouvée pour cet utilisateur." });
    }

    res.json(stores); // Retourne toutes les boutiques
  } catch (err) {
    console.error("Erreur lors de la récupération des boutiques :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

exports.checkUserStores = async (req, res) => {
  try {
    const userId = req.params.id;

    const stores = await storeModel.collection.find({ userId: userId }).toArray(); // Trouve toutes les boutiques
    if (!stores || stores.length === 0) {
      return res.status(200).json({ message: "Aucune boutique trouvée pour cet utilisateur." });
    }

    res.json(stores); // Retourne toutes les boutiques
  } catch (err) {
    console.error("Erreur lors de la récupération des boutiques :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

exports.createStore = async (req, res) => {
  const token = req.cookies.authToken;
  try {
    const { name, description, site, logo } = req.body;

    const userId = req.user.userId;

    const response = await axios.get('http://localhost:3000/user', {
      headers: { Cookie: `authToken=${token}` },
    });

    const user = response.data;

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent créer un magasin" });
    }

    const existingStore = await storeModel.getByNameAndOwner(name, userId);
    if (existingStore) {
      return res.status(400).json({ message: 'Vous avez déjà créé ce magasin' });
    }

    if (!name) {
      return res.status(400).json({ message: "Le nom de la boutique est requis" });
    }

    const newStore = {
      name: name,
      description: description,
      site: site,
      logo: logo,
      userId: userId
    };

    const createdStore = await storeModel.create(newStore);
    res.status(201).json(createdStore);
  } catch (err) {
    console.error("Erreur lors de la création du magasin :", err);
    res.status(500).json({ message: "Erreur lors de la création du magasin" });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedFields = {
      name: req.body.name
    };
    const success = await storeModel.updateById(id, updatedFields);
    if (!success) {
      res.status(404).json({ message: 'Magasin non trouvé' });
    } else {
      res.json({ message: 'Magasin mis à jour' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du magasin' });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await storeModel.deleteById(id);
    if (!success) {
      res.status(404).json({ message: 'Magasin non trouvé' });
    } else {
      res.status(200).json({ message: 'Magasin supprimé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du magasin' });
  }
};