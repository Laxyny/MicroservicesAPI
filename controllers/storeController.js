const { StoreModel } = require('../models/storeModel');

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
        res.status(404).json({ message: 'Magasin non trouvé' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération du magasin' });
    }
  };

exports.createStore = async (req, res) => {
    try {
        const { name, description, site, logo } = req.body;

        // Vérifiez si l'utilisateur connecté a le rôle "seller"
        const userId = req.user.userId; 
        const userRole = req.user.role; 

        if (!userId || userRole !== "seller") {
            return res.status(403).json({ message: "Accès refusé : Seuls les vendeurs peuvent créer un magasin" });
        }

        if (!name) {
            return res.status(400).json({ message: "Le nom de la boutique est requis" });
        }

        const newStore = {
            name: name,
            description: description,
            site: site,
            logo: logo,
            userId: userId // Associer le magasin à l'utilisateur
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