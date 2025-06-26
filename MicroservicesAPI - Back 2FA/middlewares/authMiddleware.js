const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        const now = Date.now();

        // Vérif token expiré
        if (tokenData.expiresIn < now) {
            res.clearCookie('authToken');
            return res.status(401).json({ message: 'Session expirée' });
        }

        req.user = tokenData;
        next();
    } catch (err) {
        res.clearCookie('authToken');
        console.error("Erreur de parsing du token :", err);
        return res.status(401).json({ message: 'Token invalide' });
    }
};

module.exports = authMiddleware;