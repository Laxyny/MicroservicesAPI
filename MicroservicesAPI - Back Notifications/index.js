const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const notificationRoutes = require('./routes/notificationRoutes');
const notificationController = require('./controllers/notificationController');
const config = require('./config/config');

const client = new MongoClient(config.mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.corsOrigin,
        credentials: true,
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));

async function run() {
    try {
        // Connexion à la base de données
        await client.connect();
        const database = client.db("Stockage");

        const notificationsCollection = database.collection("Notifications");

        notificationController.init(io, notificationsCollection);

        // WebSocket
        io.on('connection', socket => {
            console.log('Nouvelle connexion Socket.io:', socket.id);

            socket.on('authenticate', userId => {
                console.log(`Utilisateur ${userId} authentifié sur socket ${socket.id}`);
                socket.join(`user-${userId}`);
                socket.emit('authenticated', { success: true });
            });

            socket.on('disconnect', () => {
                console.log('Socket déconnecté:', socket.id);
            });
        });

        // Routes
        app.use('/', notificationRoutes);

        // Gérer les erreurs 500 (erreurs serveur)
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        });

        // Route pour verif le statut de l'API
        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'UP' });
        });

        // Middleware
        app.use((req, res, next) => {
            res.status(404).send('<h1> 404 Page non trouvée</h1>');
        });

        // Démarrer le serveur
        server.listen(config.port, () => {
            console.log(`API Notifications en cours d'exécution sur http://localhost:${config.port}`);
        });

    } catch (err) {
        console.error(err);
    }
}

run().catch(console.dir);
