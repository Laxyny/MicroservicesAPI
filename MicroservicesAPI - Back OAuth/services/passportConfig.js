const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { UserModel } = require('../models/userModel');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:Test1234@cluster.eovny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const client = new MongoClient(uri);

async function getUserModel() {
    await client.connect();
    const database = client.db("Stockage");
    const userCollection = database.collection("Users");
    return new UserModel(userCollection);
}

passport.use(new GoogleStrategy({
    clientID: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    callbackURL: 'http://localhost:5000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userModel = await getUserModel();
            const user = await userModel.findOrCreate(profile);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userModel = await getUserModel();
        const user = await userModel.getById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;