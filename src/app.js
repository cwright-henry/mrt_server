const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config')
const cors = require('cors')
const morgan = require('./config/morgan')
const { MongoError } = require('mongodb');

const app = express()

// Setup global middleware
app.use(morgan())
app.use(bodyParser.json({limit: '50mb'}))
app.use(cors())

// Latest version of mongoose driver 5.3.3 requires these flags for mongo > 3.1
// we are using 3.6.1
mongoose.connect(config.db.baseURL, {useNewUrlParser: true, useCreateIndex: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB connection error"));

require('./passport')
require('./routes')(app)

app.set('port', config.port);

// Appplication Level error handling - should this be here??
app.use((error, req, res, next) => {
	console.log(error.stack)
	if (error instanceof MongoError) {
		if (error.code === 11000) {
			const err = new Error('Must be unique')
			err.statusCode = 400;
			next(err);
		} 
		else {
			const err = new Error('Database Error')
			err.statusCode = 500;
			next(err);
		}
	}
	else {
		next(error)
	}
});

/**
 * Default error handler
 */
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }
  res.status(error.statusCode || 500).send({msg: error.message})
});

// Start App
app.listen(app.get('port'), () => {
	console.log('Server started on ' + app.get('port'));
});