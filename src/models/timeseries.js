const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const FitSchema = new mongoose.Schema({
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
	resid: [],
	R2: {
		type: Number,
		default: 0.0 
	}, 
	resid_mean: {
		type: Number,
		default: 0.0 
	},
	resid_std: {
		type: Number,
		default: 0.0 
	},
	resid_skew: {
		type: Number,
		default: 0.0 
	},
	resid_kurt: {
		type: Number,
		default: 0.0 
	},
	start_date: {
		type: Number,
		default: new Date().getTime()
	},
	end_date: {
		type: Number,
		default: new Date().getTime()
	}
});

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
	proctype: {
		type: String,
		enum: ['OU'],
		default: 'OU'
	},
	fit: {
		required: true,
		type: FitSchema	
	},
	current_fit: {
		required: false,
		type: FitSchema	
	},
	sltp: {
		required: false
	},
	ts: [],
	created: {
		type: Number,
		default: new Date().getTime()
	},
	lastUpdate: {
		type: Number,
		default: new Date().getTime()
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

