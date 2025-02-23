const express = require('express');
const cors = require('cors');
const passport = require('./services/passportConfig');
const session = require('express-session');
const app = express();
const port = 5000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const userController = require('./controllers/userController');

const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/authMiddleware');

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
app.use(express.static('public'));

// Config express-session
app.use(session({
    secret: '0d9ce4a907b998d03ad326b867ba17a070428babf013b616e83473127cecbe9d7b92cf3cc02cf32c2fb29cf35f1d5be00eb7b1b716a5b1d67f1ae5ad7c5be61e', 
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

//Middleware pour le front
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

async function run() {
    try {
        // Connexion à la base de données
        await client.connect();
        const database = client.db("Stockage");

        const usercollection = database.collection("Users");
        const tokenCollection = database.collection("Tokens");

        userController.init(usercollection, tokenCollection);

        app.use('/', userRoutes);

        app.get('/', authMiddleware, (req, res) => {
            res.sendFile(__dirname + '/public/homepage.html');
        });

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