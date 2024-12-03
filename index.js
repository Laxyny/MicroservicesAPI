const express = require('express');
const app = express();
const port = 3000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const userController = require('./controllers/userController');
const storeController = require('./controllers/storeController');

const uri = "mongodb+srv://user:Test1234@cluster.eovny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

async function run() {
    try {
        // Connexion à la base de données
        await client.connect();
        const database = client.db("Stockage");

        const usercollection = database.collection("Users");
        const tokenCollection = database.collection("Tokens");
        const storeCollection = database.collection("Stores");
        
        userController.init(usercollection, tokenCollection);
        storeController.init(storeCollection);

        app.use('/', userRoutes);

        // Route pour afficher le form de connexion
        app.get('/login', (req, res) => {
            res.sendFile(__dirname + '/public/login.html');
        });

        //Route pour le register
        app.get('/register', (req, res) => {
            res.sendFile(__dirname + '/public/register.html');
        });

        // Gérer les erreurs 500 (erreurs serveur)
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        });

        // Middleware
        app.use((req, res, next) => {
            res.status(404).json({ message: "La route demandée n'existe pas." });
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