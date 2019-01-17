const MRT = require('../services/MRT');

/**
 * Simple proxy onto MRT lib server
 */
module.exports = {
	async getAll(req, res) {
		const {kappa, sigma, theta, carry, x_T, trans_oneway_stdev} = req.query;
		const payload = {
			kappa: parseFloat(kappa),
			sigma: parseFloat(sigma),
			theta: parseFloat(theta),
			carry: parseFloat(carry),
			x_T: parseFloat(x_T),
			trans_oneway_stdev: parseFloat(trans_oneway_stdev)
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
	 * kappa, sigma or theta so these are optional
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async getFit(req, res) {
		let {ts, start_date, end_date, kappa, sigma, theta} = req.validated.body;

		const params = {
			ts,
			start_date,
			end_date
		}

		if(kappa) {
			params.kappa = kappa
		}
		if(sigma) {
			params.sigma = sigma
		}
		if(theta) {
			params.theta = theta
		}

		const fit = await MRT.getFit(params);
		res.send(fit);
	},
		
	async getScenarios(req, res) {
		const {kappa, sigma, theta, x_0, x_0_date, nsteps, seed} = req.validated.query;
		const params = {
			kappa,
			sigma,
			theta,
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