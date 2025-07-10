require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { UserModel } = require('../models/userModel');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getUserModel() {
    await client.connect();
    const database = client.db("Auth");
    const userCollection = database.collection("Users");
    return new UserModel(userCollection);
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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