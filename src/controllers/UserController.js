const User = require('../models/users')
const jwt = require('jsonwebtoken')
const UserHistory = require('../models/userhistory');
const Utils = require('../utils/utils')

function jwtSignUser(user) {
	const ONE_DAY = 60 * 60 * 24 * 1
	return jwt.sign(user, process.env.APP_SECRET, {
		expiresIn: ONE_DAY
	})
}

module.exports = {
	/**
	 * Register a new user
	 */
	async register(req, res) {
		try {
			const { email, password, firstName, lastName } = req.validated.body

			const newUser = new User({
				firstName,
				lastName,
				email,
				password
			});
			const user = await User.create(newUser)
			const userJson = user.toJSON()
			res.send({
				user: userJson,
				token: jwtSignUser(userJson)
			})
		}
		catch (err) {
			res.status(400).send({
				error: 'This email account is already in use.'
			})
		}
	},

	/**
	 * User's email must be unique
	 */
	async login(req, res) {
		try {
			const { email, password } = req.validated.body
			const user = await User.findByEmail(email)

			if (!user || user.tokenRevoked) {
				return res.status(403).send({
					code: 'INVALID_LOGIN'
				})
			}

			const isPasswordValid = await User.comparePassword(password, user.password)
			if (!isPasswordValid) {
				return res.status(403).send({
					code: 'INVALID_LOGIN'
				})
			}

			const userHistory = new UserHistory({
				action: 'LOGIN',
				meta: Utils.createMeta(req),
				user
			});
			await userHistory.save();

			const details = user.toJSON()
			delete details.password;
			res.send({
				user: details,
				token: jwtSignUser(details)
			})
		}
		catch (err) {
			res.status(500).send({
				error: 'An error has occured trying to log in'
			})
		}
	},

	/**
	 * Update user password.
	 * 
	 * Find a valid user
	 * Check that the password matchs existing one - maybe user left treminal logged in
	 * create a new hash for the new password
	 */
	async updatePassword(req, res) {
		const { user } = req;
		const { oldPassword, newPassword } = req.validated.body;

		const query = {
			_id: user._id
		}
		const fullUser = await User.findOne(query)
		if (!fullUser) {
			return res.status(400).send({
				code: 'INVALID_LOGIN'
			})
		}

		const isMatch = await User.comparePassword(oldPassword, fullUser.password)
		if (!isMatch) {
			return res.status(400).send({
				code: 'PASSWORD_MISMATCH'
			})
		}

		const hash = await User.createHash(newPassword)

		const update = {
			password: hash,
		}

		await User.findOneAndUpdate(query, update).exec();

		return res.status(200).send();
	}
}