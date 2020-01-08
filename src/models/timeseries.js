const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * A timeseries has the following characteristics:
 * 
 * 1. Cache of external timeseries that expire after one day
 * 2. We save the source
 * 3. The name or identifier should be unqiue
 */
const TimeSeriesSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	source: {
		type: String,
		required: true,
		trim: true
	},
	data: [],
	createdAt: {
		type: Date,
		expires: '4h',
		default: Date.now
	}
});

module.exports = mongoose.model('timeseries', TimeSeriesSchema);


