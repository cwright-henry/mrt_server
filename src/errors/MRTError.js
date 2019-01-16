/**
 * If MRT throws then this should be a 500 error. In away we
 * are running as a reverse proxy (look up defintiion)
 * 
 * Notes on 500:
 * 
 * 502 Did not recieve a valid response from origin server i.e. origin server took too long to return
 * 503 Origin service is not avaliable - crashed or down for maintenance!
 * 504 Gateway timeout - what is the difference between this and 502
 * 
 */
module.exports = class MRTError extends require('./AppError') {
  constructor (error, params) {
		const err = {}
		err.error = error;
		err.param = params;
    super(JSON.stringify(err), 500);
  }
};