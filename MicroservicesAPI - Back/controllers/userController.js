const { UserModel, verifyPassword } = require('../models/userModel');
const TokenModel = require('../models/tokenModel');
const { generateToken } = require('../services/tokenService');
const crypto = require('crypto');

let userModel;
let tokenModel

exports.init = (userCollection, tokenCollection) => {
  userModel = new UserModel(userCollection);
  tokenModel = new TokenModel(tokenCollection);
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.getById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération du user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    if (!password || !name || !email) {
      return res.status(400).json({ message: 'Tout les champs doivent être remplis' });
    }

    const existingUser = await userModel.getByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const newUser = {
      email: email,
      name: name,
      password: password,
      role: role ?? "user"
    };

    const createdUser = await userModel.create(newUser);
    res.status(201).json(createdUser);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedFields = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
    const success = await userModel.updateById(id, updatedFields);
    if (!success) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    } else {
      res.json({ message: 'Utilisateur mis à jour' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await userModel.deleteById(id);
    if (!success) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    } else {
      res.status(200).json({ message: 'Utilisateur supprimé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.collection.findOne({
      email: email
    });

    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const storedHash = user.passwordHash.hash;
    const salt = user.passwordHash.salt;
    const isPasswordValid = verifyPassword(password, storedHash, salt);

    if (isPasswordValid) {
      const tokenData = generateToken(req, user);

      if (!tokenData) {
        console.log("Échec du proof of work");
        return res.status(500).json({ message: "Erreur lors de la génération du token" });
      }

      console.log("Enregistrement du token dans la BDD");
      const storedToken = await tokenModel.create(tokenData);
      console.log("Token sauvegardé", storedToken);

      const tokenString = Buffer.from(JSON.stringify(tokenData)).toString('base64');

      res.cookie('authToken', tokenString, {
        httpOnly: true,
        maxAge: 900000, // 15 min
      });

      res.json({ message: 'Authentification réussie', token: tokenString });
    } else {
      console.log("Mot de passe incorrect");
      res.status(401).json({ message: 'Mot de passe incorrect' });
    }
  } catch (err) {
    console.error('Erreur lors de l\'authentification', err);
    res.status(500).json({ message: 'Erreur lors de l\'authentification' });
  }
};

exports.getUserFromToken = async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const userId = tokenData.userId;

    const user = await userModel.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Déconnexion réussie' });
};
