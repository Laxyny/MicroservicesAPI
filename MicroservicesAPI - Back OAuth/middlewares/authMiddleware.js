const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/login'); // Si pas de token alors -> Login
    }

    try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        const now = Date.now();

        console.log("Token data:", tokenData); // Ajout d'un log pour déboguer

        // Vérif token expiré
        if (tokenData.expiresIn < now) {
            res.clearCookie('authToken'); // Supprime les cookies
            return res.redirect('/login');
        }

        req.user = tokenData;
        next();
    } catch (err) {
        res.clearCookie('authToken');
        console.error("Erreur de parsing du token :", err);
        return res.redirect('/login');
    }
};

module.exports = authMiddleware;