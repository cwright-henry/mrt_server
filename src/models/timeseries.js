const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const fittingSchema = require('./FittingSchema')
const NoFittingSchema = require('./NoFittingSchema')
const OUFittingSchema = require('./OUFittingSchema')

const Schema = mongoose.Schema;

const TimeSeriesSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	source: {
		type: String,
		required: true,
		trim: true,
		enum: ['SYSTEM', 'CSV', 'AV'],
		default: 'SYSTEM'
	},
	fit: {
		required: true,
		type: fittingSchema
	},
	sltp: {
		required: false
	},
	ts: [],
	created: {
		type: Number,
		default: Date.now
	},
	lastUpdate: {
		type: Number,
		default: Date.now
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});

TimeSeriesSchema.plugin(mongoosePaginate)

TimeSeriesSchema.virtual('url').get(function () {
    return '/mrt/timeseries/' + this._id;
});

TimeSeriesSchema.path('fit').discriminator('NONE', NoFittingSchema)
TimeSeriesSchema.path('fit').discriminator('OU', OUFittingSchema)

/**
 * Export the model to create the schema
 */
const TimeSeries = module.exports = mongoose.model('timeseries', TimeSeriesSchema);

/**
 * Create a timeseries using callbacks
 */
module.exports.create = function(timeseries) {
    return timeseries.save();
}

/**
 * Find by name
 */
module.exports.findByName = function(name) {
	const query = {name:name};
    return TimeSeries.findOne(query).exec();
}

/**
 * Find by user id
 */
module.exports.findByUser = function(userId) {
	const query = {user:userId};
	return TimeSeries.find(query).exec();
}

/**
 * Paginate over a user timeseries
 */
module.exports.page = function(query, options) {
  return TimeSeries.paginate(query, options)
}

/**
 * Remove by user and id
 */
module.exports.remove = function(user, id) {
	const query = {_id: id, user: user};
	return TimeSeries.findOneAndRemove(query).exec();
}

