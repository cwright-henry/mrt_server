const MRT = require('../services/MRT');
const Strategy = require('../models/strategies');
const Utils = require('../utils/utils');

/**
 * Simple proxy onto MRT lib server
 */
module.exports = {
	async getAll(req, res) {
		const {proctype, kappa, sigma, theta, carry, x_0, trans_oneway_stdev} = req.validated.query;
		const payload = {
			proctype,
			kappa,
			sigma,
			theta,
			carry,
			x_0,
			trans_oneway_stdev
		}
		const result = await MRT.getAll(payload);
		res.send(result);
	},
    
	async getProb(req, res) {
		const result = await MRT.getProb();
		res.send(result);
	},
    
	async getEpnl(req, res) {
		const result = await MRT.getEpnl();
		res.send(result);
	},
		
	async getEt(req, res) {
		const result = await MRT.getEt();
		res.send(result);
	},

	/**
	 * Fit 2 timeseries, by default we are using LSPairfit
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async getFitLSE(req, res) {
		let {ts1, ts2} = req.validated.body;

		const params = {
			ts1,
			ts2
		}

		res.send(await MRT.getFitLSE(params));
	},
		
	/**
	 * Fit a timeseries. The first time this is called a strategy has no
	 * kappa, sigma or theta so these are optional. The ts is loaded from
	 * the strategy.
	 * 
	 * @param {*} req The JOI validated query
	 * @param {*} res 
	 */
	async getFit(req, res) {
		const {user} = req;
		let {proctype, strategyId, start_date, end_date, kappa, sigma, theta, nbeta} = req.validated.query;

		let query = {
			user: user._id,
			_id: strategyId
		};

		let strategy = await Strategy.findOne(query).select('ts').lean().exec()
		
		const params = {
			proctype,
			ts: strategy.ts.data,
			start_date,
			end_date
		}

		if(!Utils.isEmpty(kappa)) {
			params.kappa = kappa
		}
		if(!Utils.isEmpty(sigma)) {
			params.sigma = sigma
		}
		if(!Utils.isEmpty(theta)) {
			params.theta = theta
		}
		if(!Utils.isEmpty(nbeta)) {
			params.nbeta = nbeta
		}

		res.send(await MRT.getFit(params));
	},
		
	async getScenarios(req, res) {
		const {proctype, kappa, sigma, theta, nbeta, x_0, x_0_date, nsteps, seed} = req.validated.query;
		const params = {
			proctype,
			kappa,
			sigma,
			theta,
			nbeta,
			x_0,
			x_0_date,
			nsteps,
			seed
		}

		res.send(await MRT.getScenarios(params));
	},
		
	async getBarrierScenarios(req, res) {
		const result = await MRT.getBarrierScenarios();
		res.send(result);
	}
}