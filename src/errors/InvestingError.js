module.exports = class InvestingError extends require('./AppError') {
  constructor (code, error, params, status) {
		const err = {}
		err.error = error;
		err.param = params;
    super(code, status, JSON.stringify(err));
  }
};