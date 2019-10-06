const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	companyName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	created: {
		type: Number,
		default: Date.now
	},
	lastUpdate: {
		type: Number,
		default: Date.now
	}
});

UserSchema.virtual('name').get(function () {
	return this.firstName + ' ' + this.lastName;
});

UserSchema.virtual('url').get(function () {
	return '/mrt/user/' + this._id;
});

/**
 * Note: each model has an associated connection.
 */
const User = module.exports = mongoose.model('users', UserSchema);

/**
 * Create a user using callbacks
 */
module.exports.create = function (newUser) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(newUser.password, salt, function (err, hash) {
				if (err) reject(err);
				newUser.password = hash;
				resolve(newUser.save());
			});
		});
	});
}

module.exports.createHash = function (password) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(password, salt, function (err, hash) {
				if (err) reject(err);
				resolve(hash);
			});
		});
	});
}

module.exports.getUseById = function (id, cb) {
	return User.findById(id, cb);
}

/**
 * Find a user and return a promise
 */
module.exports.findByEmail = function (email) {
	var query = { email: email };
	return User.findOne(query).exec();
}

/**
 * Compare passwords
 */
module.exports.comparePassword = function (password, hash) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, hash, function (err, isMatch) {
			if (err) reject(err);
			resolve(isMatch);
		});
	});
}



