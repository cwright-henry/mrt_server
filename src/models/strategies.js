const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const fittingSchema = require('./Fitting')
const NoFittingSchema = require('./NoFitting')
const OUFittingSchema = require('./OUFitting')
const HypOUFittingSchema = require('./HypOUFitting')
const Schema = mongoose.Schema;

/**
 * A strategy has the following characteristics:
 * 
 * 1. A strategy is created with associated user and underlying timeseries.
 * 2. The fitting is initially NONE but is changed by user to OU, browian motion etc..
 * 3. We add pagination through the paginate-v2 lib, this supports the user of cursors
 * 4. The combination of strategy name and user is unique. false is added to name so that
 * 		mongoose does not create three unique indexs only one on the (name, user) to create a 
 * 		compound index.
 * 5. A strategy may only have one underlying timeseries
 */
const StrategySchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: false
	},
	fit: {
		required: true,
		type: fittingSchema
	},
	sltp: {
		required: false
	},
	ts: {
		source: {
			type: String,
			required: true,
			trim: true,
			enum: ['SYSTEM', 'CSV', 'COMBO'],
			default: 'SYSTEM'
		},
		data: []
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		unique: false
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

StrategySchema.index({ name: 1, user: 1 }, { unique: true })
StrategySchema.plugin(mongoosePaginate)
StrategySchema.path('fit').discriminator('NONE', NoFittingSchema)
StrategySchema.path('fit').discriminator('OU', OUFittingSchema)
StrategySchema.path('fit').discriminator('hypOU', HypOUFittingSchema)

module.exports = mongoose.model('strategies', StrategySchema);