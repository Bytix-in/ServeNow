const mongoose = require('mongoose');
const dbPassword = process.env.DB_PASSWORD;

require('dotenv').config();

mongoose.connect(`mongodb+srv://omprakashbytix:${dbPassword}@testing1.znohucg.mongodb.net/ServeNow-Auth`)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

module.exports = {
    mongoose : mongoose,
};