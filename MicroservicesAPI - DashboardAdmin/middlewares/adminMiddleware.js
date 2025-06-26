const axios = require('axios');

const adminMiddleware = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: 'Non authentifié. Veuillez vous connecter.' });
    }

    try {
        const response = await axios.get('http://ms_back:3000/user', {
            headers: { Cookie: `authToken=${token}` },
        });

        const user = response.data;
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
        }
        next();
    } catch (err) {
        console.error('Erreur adminMiddleware:', err);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

module.exports = adminMiddleware;