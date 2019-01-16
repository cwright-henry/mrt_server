/**
 * AsyncMiddleware is a function that takes another function and wraps it in a promise. 
 * In our use case the function it will take is an express route handler, 
 * and since we are passing that handler into Promise.resolve it will resolve 
 * with whatever value our route handler returns. 
 * 
 * If, however, one of the await statements in our handler gives us a rejected promise, i.e. throws an exception
 * it will go into the catch and be passed to next which will eventually 
 * give the error to our express error middleware to handle. 
 * Now all that remains to do is to wrap our routes in our asyncMiddleware 
 * and we will no longer have to worry about using try / catch statements in our routes.
 * 
 * @param {function} fn The function to wrap 
 */
module.exports = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
	};
	