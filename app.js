const express = require('express');
const app = express();
const mongoose = require('mongoose');
// path permet de gérer et de sauvegarder les images
const { dirname } = require('path');
const path = require('path');

// dotenv permet de sécuriser les données sensibles dans le fichier .env. Pensez à modifier les valeur dans le fichier .env_EXAMPLE
const dotenv = require('dotenv').config();


const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');


// mongoose.connect permet de se connecter à MongoDB. Process.env va chercher les informations à remplacer par l'utilisateur dans le fichier .env
mongoose.connect('mongodb+srv://'+ process.env.DB_LOGIN + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?retryWrites=true&w=majority',

    { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// remplace body.PARSON et gère les routes post
app.use(express.json());

// permet de ne pas avoir d'erreurs CORES
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;