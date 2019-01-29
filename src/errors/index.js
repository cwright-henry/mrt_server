const errorHandler = (error, req, res, next) => {
	console.log(error)
	if (error.name === 'MongoError') {
		if (error.code === 11000) {
			const err = new Error("DUPLICATE_NAME")
			err.statusCode = 400;
			next(err);
		} 
		else {
			const err = new Error('DATABASE_ERROR')
			err.statusCode = 500;
			next(err);
		}
	}
	else {
		next(error)
	}
}

const genericHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }
  res.status(error.statusCode || 500).send({code: error.message})
}


module.exports = {
	errorHandler: errorHandler,
	genericHandler: genericHandler
}