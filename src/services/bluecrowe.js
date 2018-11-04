const http = require('http');
const moment = require('moment')

const DATE_FORMAT = "YYYY-MM-DD"

class Bluecrowe {
	static _request({path, data}) {
		const opts = {
			host: 'localhost', 
			path,
			port: 5000,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length,
				'api-key': 'CWH667'
			}
		};

		return new Promise((resolve, reject) => {
			let buffers = []

			let req = http.request(opts, (result) => {
				result.on("data", (data) => {
					buffers.push(data);
				});

				result.on("end", () => {
					if(result.statusCode == 200) 
						return resolve(Buffer.concat(buffers)) 
					return reject(Buffer.concat(buffers));
				});
			});
			req.write(data)
			req.on('error', (error) => {
				return reject(error, null);
			});
			req.end();
		});
	}

	static async getAll({kappa = 1.1, sigma = 2.1, theta = 0.1, carry = 0.1, x_T = 1.1, trans_oneway_stdev = 0.05} = {}) {
		return await Bluecrowe._request({path: 'data/all2', data: JSON.stringify({kappa, sigma, theta, carry, x_T, trans_oneway_stdev})}).then((response) => JSON.parse(response));
	}

	static async getProb({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await Bluecrowe._request({path: 'data/prob', data: JSON.stringify({kappa, sigma, theta, carry, x_T})}).then((response) => JSON.parse(response));
	}

	static async getEpnl({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0, trans_oneway_stdev = 0.05} = {}) {
		return await Bluecrowe._request({path: 'data/epnl', data: JSON.stringify({kappa, sigma, theta, carry, x_T, trans_oneway_stdev})}).then((response) => JSON.parse(response));
	}

	static async getEt({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await Bluecrowe._request({path: 'data/et2', data: JSON.stringify({kappa, sigma, theta, carry, x_T})}).then((response) => JSON.parse(response));
	}

	static async getFit(ts = []) {
		const data = {};
		for(let i = 0; i < ts.length; i++) {
			const date = ts[i][0]
			const value = ts[i][1]
			data[date] = value;
		}
		const start_date = moment(ts[0][0]).format(DATE_FORMAT)
		const end_date = moment(ts[ts.length - 1][0]).format(DATE_FORMAT)

		return await Bluecrowe._request({path: 'data/fit_all', data: JSON.stringify({proctype: 'OU', ts:data, start_date: start_date, end_date: end_date})}).then((response) => JSON.parse(response));
	}

	static async getScenarios({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await Bluecrowe._request({path: 'data/get_scenarios', data: JSON.stringify({kappa, sigma, theta, carry, x_T})}).then((response) => JSON.parse(response));
	}

	static async getBarrierScenarios({kappa = 1.0, sigma = 2.0, theta = 0.0, x_T = 1.0, a_lvl = 0.5, b_lvl = 1.5} = {}) {
		return await Bluecrowe._request({path: 'data/get_barrier_scenarios', data: JSON.stringify({kappa, sigma, theta, x_T, a_lvl, b_lvl})}).then((response) => JSON.parse(response));
	}
}

module.exports = {
	getAll: Bluecrowe.getAll,
	getProb: Bluecrowe.getProb,
	getEpnl: Bluecrowe.getEpnl,
	getEt: Bluecrowe.getEt,
	getFit: Bluecrowe.getFit,
	getScenarios: Bluecrowe.getScenarios,
	getBarrierScenarios: Bluecrowe.getBarrierScenarios
}