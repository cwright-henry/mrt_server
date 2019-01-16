const MRT = require('../services/MRT');

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
		
	async getFit(req, res) {
		let {ts, start_date, end_date, kappa, sigma, theta} = req.body;

		if(!start_date) {
			start_date = ts[0][0]
		}

		if(!end_date) {
			end_date = ts[ts.length - 1][0]
		}

		const params = {
			ts,
			start_date,
			end_date
		}

		if(kappa) {
			params.kappa = parseFloat(kappa)
		}
		if(sigma) {
			params.sigma = parseFloat(sigma)
		}
		if(theta) {
			params.theta = parseFloat(theta)
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