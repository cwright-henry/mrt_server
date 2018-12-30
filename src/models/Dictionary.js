const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Invest.com Ticker Dictionary
 */
const DictionarySchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	curr_id: {
		required: true,
		type: Number,
		unique: true
	},
	type: {
		required: true,
		type: String,
		trim: true
	},
	source: {
		required: true,
		type: String,
		trim: true
	}
});

module.exports = mongoose.model('dictionaries', DictionarySchema);