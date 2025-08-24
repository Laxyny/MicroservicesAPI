const express = require('express');
const cors = require('cors');
const app = express();
const port = 3006;

const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');

const categoryController = require('./controllers/categoryController');

const cookieParser = require('cookie-parser');

const uri = "mongodb+srv://user:Test1234@cluster.eovny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

//Middleware pour le front
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

async function run() {
    try {
        // Connexion à la base de données
        await client.connect();
        const database = client.db("Catégories");

        const categoryCollection = database.collection("Category");

        categoryController.init(categoryCollection);
        
        app.use('/', categoryRoutes);

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
        app.listen(port, () => {
            console.log(`API en cours d'exécution sur http://localhost:${port}`);
        });

    } catch (err) {
        console.error(err);
    }
}

run().catch(console.dir);