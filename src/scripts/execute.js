require('dotenv').config()

module.exports.execute = (fn) => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true });
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    mongoose.connection.on('connected', fn.bind(null, mongoose));
}