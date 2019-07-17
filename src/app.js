require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const { LoggingMiddleware, Logger } = require('./utils/logging')
const { errorHandler, genericHandler } = require('./errors')

const app = express()

// Logging
app.use(LoggingMiddleware)

// JSON body parser
app.use(bodyParser.json({ limit: process.env.APP_MAX_UPLOAD }))

// CORS
app.use(cors())

// DB Config
// Latest version of mongoose driver 5.3.3 requires these flags for mongo > 3.1
// we are using 3.6.1
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB connection error"));

// Security
require('./passport')

// Routes
require('./routes')(app)

// Port
app.set('port', process.env.APP_PORT);

// Error Handling
app.use(errorHandler);
app.use(genericHandler);

// Start App
app.listen(app.get('port'), () => {
	Logger.info(`Server started on ${app.get('port')}`);
});