/**
 * Proposal: All errors should have the following
 * 1. Error Code - read by client - to display an error message
 * 2. Error Status - keep it general 400 client error, 500 internal error (Unknown error)
 * 3. Message - parameters of the call to reproduce error
 * 
 * Notes: 
 * 1. In production/developement log all 500 errors
 * 2. Should we log all bad requests i.e. probably not ticker lookup
 */
module.exports = class AppError extends Error {
  constructor (code, status, message) {
  
    // Calling parent constructor of base Error class.
    super(code);
    
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
    
    // You can use any additional properties you want.
    // I'm going to use preferred HTTP status for this error types.
    // `500` is the default value if not specified.
    this.details = message;
    this.statusCode = status || 500;
  }
};