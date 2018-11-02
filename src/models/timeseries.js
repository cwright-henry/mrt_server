const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
		trim: true
	},
	fit: {
		type: {
			kappa: {
				type: Number,
				default: 0.0
			},
			sigma: {
				type: Number,
				default: 0.0
			},
			theta: {
				type: Number,
				default: 0.0
			},
			adf_stat: {
				type: Number,
				default: 0.0 
			},
			p_val: {
				type: Number,
				default: 0.0 
			},
			sig_lev: {
				type: String,
				default: '' 
			},
			start_date: {
				type: Date,
				default: Date.now 
			},
			end_date: {
				type: Date,
				default: Date.now 
			}
		},
		required: true
	},
	sltp: {
		required: false
	},
	ts: [],
	created: {
		type: Date,
		default: Date.now
	},
	lastUpdate: {
		type: Date,
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

