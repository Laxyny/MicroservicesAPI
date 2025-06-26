const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;

    const isApiRequest = req.xhr || req.headers.accept?.includes('application/json');

    if (!token) {
        if (isApiRequest) {
            return res.status(401).json({ message: 'Non authentifié' });
        }
        return res.redirect('/login');
    }


    try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        const now = Date.now();

        console.log("Token data:", tokenData); // Ajout d'un log pour déboguer

        // Vérif token expiré
        if (tokenData.expiresIn < now) {
            res.clearCookie('authToken');
            if (isApiRequest) {
                return res.status(401).json({ message: 'Session expirée' });
            }
            return res.redirect('/login');
        }

        req.user = tokenData;
        next();
    } catch (err) {
        res.clearCookie('authToken');
        if (isApiRequest) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        return res.redirect('/login');
    }
};

module.exports = authMiddleware;