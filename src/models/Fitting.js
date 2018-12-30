const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Generics fitting from where other fitting are inherited.
 * 
 * 1. We record the creation and updates against the fitting
 * 2. The discrimator type is defined as the proctype
 * 3. We do not assign a mongo id for the fitting
 */
const fittingSchema = new Schema({
	created: {
		type: Number,
		default: Date.now
	},
	lastUpdate: {
		type: Number,
		default: Date.now
	}
}, {
	discriminatorKey: 'proctype', 
	_id: false 
})

module.exports = fittingSchema;