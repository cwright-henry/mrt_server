const passport = require('passport')
const { roles } = require('./roles')

/**
 * Only verifies that the token is valid and token
 * has not been revoked
 */
exports.isAuthenticated = function (req, res, next) {
	passport.authenticate('jwt', function (err, user) {
		if (err || !user) {
			res.status(403).send({
				code: 'TOKEN_EXPIRED'
			})
		}
		else if (user.tokenRevoked) {
			res.status(403).send({
				code: 'TOKEN_REVOKED'
			})
		}
		else {
			req.user = user
			next()
		}
	})(req, res, next)
}

exports.grantAccess = function (action, resource) {
	return async (req, res, next) => {
		try {
			const permission = roles.can(req.user.role)[action](resource);
			if (!permission.granted) {
				return res.status(403).json({
					error: "You don't have enough permission to perform this action"
				});
			}
			next()
		} catch (error) {
			next(error)
		}
	}
}