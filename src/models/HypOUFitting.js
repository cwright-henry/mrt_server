const mongoose = require('mongoose');

const HypOUFittingSchema = new mongoose.Schema({
	kappa: {
		type: Number,
		default: 0.0
	},
	kappa_full: {
		type: Number,
		default: 0.0
	},
	sigma: {
		type: Number,
		default: 0.0
	},
	sigma_full: {
		type: Number,
		default: 0.0
	},
	nBeta: {
		type: Number,
		default: 1.0
	},
	nBeta_full: {
		type: Number,
		default: 1.0
	},
	theta: {
		type: Number,
		default: 0.0
	},
	theta_full: {
		type: Number,
		default: 0.0
	},
	adf_stat: {
		type: Number,
		default: 0.0 
	},
	adf_stat_full: {
		type: Number,
		default: 0.0 
	},
	p_val: {
		type: Number,
		default: 0.0 
	},
	p_val_full: {
		type: Number,
		default: 0.0 
	},
	sig_lev: {
		type: String,
		default: '' 
	},
	sig_lev_full: {
		type: String,
		default: '' 
	},
	resid: [],
	R2: {
		type: Number,
		default: 0.0 
	},
	R2_full: {
		type: Number,
		default: 0.0 
	}, 
	resid_mean: {
		type: Number,
		default: 0.0 
	},
	resid_mean_full: {
		type: Number,
		default: 0.0 
	},
	resid_std: {
		type: Number,
		default: 0.0 
	},
	resid_std_full: {
		type: Number,
		default: 0.0 
	},
	resid_skew: {
		type: Number,
		default: 0.0 
	},
	resid_skew_full: {
		type: Number,
		default: 0.0 
	},
	resid_kurt: {
		type: Number,
		default: 0.0 
	},
	resid_kurt_full: {
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
}, {
	_id: false 
});

module.exports = HypOUFittingSchema;