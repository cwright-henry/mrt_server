const User = require('../models/users')
const jwt = require('jsonwebtoken')
const UserHistory = require('../models/userhistory');
const Strategy = require('../models/strategies');
const Dictionary = require('../models/Dictionary');
const Investing = require('../services/investing');

function jwtSignUser(user) {
	const ONE_DAY = 60 * 60 * 24 * 1
	return jwt.sign(user, process.env.APP_SECRET, {
		expiresIn: ONE_DAY
	})
}

module.exports = {
	/**
	 * Must have an admin role
	 */
	async login(req, res) {
		try {
			let { email, password } = req.validated.body
			const user = await User.findByEmail(email)

			if (!user) {
				return res.status(403).send({
					code: 'INVALID_LOGIN'
				})
			}

			if (!(user.role === 'admin')) {
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

			const details = user.toJSON()
			delete details.password;
			delete details.tokenRevoked;
			delete details.role;
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
	 * Set user password. In case they forgot!
	 * 
	 * Find a valid user
	 * create a new hash for the new password
	   */
	async setPassword(req, res) {
		const { newPassword, userId } = req.validated.body;

		const query = {
			_id: userId
		}
		const fullUser = await User.findOne(query)
		if (!fullUser) {
			return res.status(400).send({
				code: 'INVALID_USER'
			})
		}

		const hash = await User.createHash(newPassword)

		const update = {
			password: hash,
			lastUpdate: new Date()
		}

		const { password, ...details } = await User.findOneAndUpdate(query, update, { new: true }).lean().exec();

		res.status(200).json({
			details
		});
	},

	/**
	 * Update User
	 * 
	 * Find a valid user
	 * Set the revoke status
	   */
	async updateUser(req, res) {
		const { userId, status, firstName, lastName, companyName, email } = req.validated.body;

		const query = {
			_id: userId
		}
		const user = await User.findOne(query)
		if (!user) {
			return res.status(400).send({
				code: 'INVALID_USER'
			})
		}

		const update = {
			tokenRevoked: status,
			firstName,
			lastName,
			companyName,
			email,
			lastUpdate: new Date()
		}

		const { password, ...details } = await User.findOneAndUpdate(query, update, { new: true }).lean().exec();

		res.status(200).json({
			details
		});
	},

	/**
	 * Get a paginated list of users
	 */
	async getUsers(req, res, next) {
		const { offset, limit, search } = req.validated.query

		let query = {};
		if (search && search !== '') {
			query.lastName = new RegExp(search, "i");
		}

		const options = {
			page: offset,
			limit: limit,
			sort: {
				lastUpdate: -1
			},
			select: '-password',
			lean: true
		};

		return res.send(await User.paginate(query, options));
	},

	/**
	 * Get user details but omit the password eventhough its
	 * MD5 encrypted
	 */
	async getUser(req, res, next) {
		const { userId } = req.validated.query;
		const user = await User.findById(userId).lean();
		if (!user) return next(new Error('User does not exist'));
		const { password, ...details } = user;
		res.status(200).json({
			details
		});
	},

	/**
	 * Paginated list of user history, only show login
	 * actions
	 */
	async userHistory(req, res) {
		const { offset, limit, userId } = req.validated.query

		const query = {
			user: userId,
			action: 'LOGIN'
		}

		const options = {
			page: offset,
			limit: limit,
			sort: {
				created: -1
			}
		}

		res.send(await UserHistory.paginate(query, options));
	},

	/**
	 * Create a new user
	 */
	async createUser(req, res) {
		const { firstName, lastName, companyName, email, password } = req.validated.body;

		const user = new User({
			firstName,
			lastName,
			companyName,
			email,
			password
		});

		const newUser = await User.create(user);
		delete newUser.password;

		res.status(200).json({
			newUser
		});
	},

	/**
	 * Remove user
	 * Remove history
	 * Remove strategies
	 */
	async removeUser(req, res) {
		const { userId } = req.validated.body;

		await UserHistory.deleteMany({
			user: userId
		}).exec();

		await Strategy.deleteMany({
			user: userId
		}).exec();

		await User.deleteOne({
			_id: userId
		}).exec();

		res.status(200).json();
	},

	/**
	 * Create a new ticker
	 */
	async createTicker(req, res) {
		const { name, curr_id, type } = req.validated.body;

		let dictionary = new Dictionary({
			name: name.toUpperCase(),
			curr_id,
			type,
			source: "Investing.com"
		})

		dictionary = Dictionary.create(dictionary);

		res.status(200).json({
			dictionary
		});
	},

	/**
	 * Test if a ticker exists
	 * 
	 * 200 Yes, all OK
	 * 409 Exists Already - conflict response
	 * 404 Not Found
	 */
	async testTicker(req, res) {
		const { curr_id } = req.validated.query;

		const query = {
			curr_id
		};
		const dictionaryEntry = await Dictionary.findOne(query).lean().exec();

		if (dictionaryEntry) {
			return res.status(409).send({ code: 'DUPLICATE_NAME' })
		}

		const results = await Investing.get(curr_id);

		if (results.length > 0) {
			return res.status(200).json();
		}
		else {
			return res.status(404).send({ code: 'NOT_FOUND' })
		}
	},

	async removeTicker(req, res) {
		const { tickerId } = req.validated.body;

		await Dictionary.deleteOne({
			_id: tickerId
		}).exec();

		res.status(200).json();
	},
}