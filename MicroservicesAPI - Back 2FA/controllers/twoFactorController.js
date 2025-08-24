const { TwoFactorModel } = require('../models/twoFactorModel');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

let twoFactorModel;

exports.init = (twoFactorCollection) => {
    twoFactorModel = new TwoFactorModel(twoFactorCollection);
};

exports.setup = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(400).json({ error: 'ID utilisateur manquant' });
        }

        const secret = speakeasy.generateSecret({
            length: 20,
            name: `LePetitLivreur:${userId}`
        });

        // Sauvegarde en BDD
        await twoFactorModel.update(userId, {
            userId,
            secret: secret.base32,
            verified: false,
            createdAt: new Date()
        });

        // Génération du QR code
        const otpauthUrl = secret.otpauth_url;
        const qrCode = await QRCode.toDataURL(otpauthUrl);

        res.json({
            secret: secret.base32,
            qrCode,
            otpauthUrl
        });
    } catch (error) {
        console.error('Erreur de configuration 2FA:', error);
        res.status(500).json({ error: 'Erreur lors de la configuration du 2FA' });
    }
};

// Code TOTP
exports.verify = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ error: 'Paramètres manquants' });
        }

        const record = await twoFactorModel.getByUserId(userId);
        
        if (!record || !record.secret) {
            return res.status(404).json({ error: 'Configuration 2FA non trouvée' });
        }

        // Vérif code TOTP
        const verified = speakeasy.totp.verify({
            secret: record.secret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            if (!record.verified) {
                await twoFactorModel.verify(userId);
            }
            
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Code invalide' });
        }
    } catch (error) {
        console.error('Erreur de vérification 2FA:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du code' });
    }
};

// Vérif statut 2FA d'un utilisateur
exports.status = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(400).json({ error: 'ID utilisateur manquant' });
        }

        const record = await twoFactorModel.getByUserId(userId);
        
        res.json({
            enabled: Boolean(record?.secret),
            verified: Boolean(record?.verified)
        });
    } catch (error) {
        console.error('Erreur de récupération du statut 2FA:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du statut 2FA' });
    }
};

// Désactivation du 2FA pour un utilisateur
exports.disable = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'ID utilisateur manquant' });
        }

        await twoFactorModel.delete(userId);
        
        res.json({ success: true, message: '2FA désactivé avec succès' });
    } catch (error) {
        console.error('Erreur de désactivation 2FA:', error);
        res.status(500).json({ error: 'Erreur lors de la désactivation du 2FA' });
    }
};