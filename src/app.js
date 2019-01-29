const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config')
const cors = require('cors')
const morgan = require('./config/morgan')
const { errorHandler, genericHandler} = require('./errors')

const app = express()

// Logging
app.use(morgan())

// Parsing
app.use(bodyParser.json({limit: '50mb'}))

// CORS
app.use(cors())

// DB Config
// Latest version of mongoose driver 5.3.3 requires these flags for mongo > 3.1
// we are using 3.6.1
mongoose.connect(config.db.baseURL, {useNewUrlParser: true, useCreateIndex: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB connection error"));

// Security
require('./passport')

// Routes
require('./routes')(app)

// Port
app.set('port', config.port);

// Error Handling
app.use(errorHandler);
app.use(genericHandler);

// Start App
app.listen(app.get('port'), () => {
	console.log('Server started on ' + app.get('port'));
});