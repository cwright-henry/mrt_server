module.exports = class AlphavantageError extends require('./AppError') {
  constructor (error, params) {
		const err = {}
		err.error = error;
		err.param = params;
    super(JSON.stringify(err), 500);
  }
};