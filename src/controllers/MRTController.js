const MRT = require('../services/MRT');

module.exports = {
	async getAll(req, res) {
		try {
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
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data All Error = ' + error);
		}
	},
    
	async getProb(req, res) {
		try {
			const result = await MRT.getProb();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Prob Error = ' + error);
		}
	},
    
	async getEpnl(req, res) {
		try {
			const result = await MRT.getEpnl();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Enpl Error = ' + error);
		}
	},
		
	async getEt(req, res) {
		try {
			const result = await MRT.getEt();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Et Error = ' + error);
		}
	},
		
	async getFit(req, res) {
		try {
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
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Fit Error = ' + error);
		}
	},
		
	async getScenarios(req, res) {
		try {
			const {kappa, sigma, theta, x_0, x_0_date} = req.query;
			const query = {
				kappa: parseFloat(kappa),
				sigma: parseFloat(sigma),
				theta: parseFloat(theta),
				x_0:  parseFloat(x_0),
				x_0_date: parseInt(x_0_date)
			}

			const result = await MRT.getScenarios(query);
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Scenarios Error = ' + error);
		}
	},
		
	async getBarrierScenarios(req, res) {
		try {
			const result = await MRT.getBarrierScenarios();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Barrier Scenarios Error = ' + error);
		}
	}
}