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

	static async getAll({proctype = 'OU', kappa = 1.1, sigma = 2.1, theta = 0.1, carry = 0.1, x_T = 1.1, trans_oneway_stdev = 0.05} = {}) {
		return await Bluecrowe._request({path: 'data/all2', data: JSON.stringify({proctype, kappa, sigma, theta, carry, x_T, trans_oneway_stdev})}).then((response) => JSON.parse(response));
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

	static async getFit({proctype = 'OU', start_date = new Date().getTime(), end_date = new Date().getTime(), ts = []} = {}) {
		const data = {};
		for(let i = 0; i < ts.length; i++) {
			const date = ts[i][0]
			const value = ts[i][1]
			data[date] = value;
		}
		start_date = moment.utc(start_date).format(DATE_FORMAT)
		end_date = moment.utc(end_date).format(DATE_FORMAT)

		return await Bluecrowe._request({path: 'data/fit_all', data: JSON.stringify({proctype, ts: data, start_date, end_date})})
			.then((response) => JSON.parse(response))
			.then((response) => {
				if(response.start_date) {
					response.start_date = moment.utc(response.start_date, DATE_FORMAT).valueOf();
				}
				if(response.end_date) {
					response.end_date = moment.utc(response.end_date, DATE_FORMAT).valueOf();
				}
				if(response.x_0_date) {
					response.x_0_date = moment.utc(response.x_0_date, DATE_FORMAT).valueOf();
				}
				if(response.resid) {
					const arr = []
					for(let t in response.resid) {
						if(response.resid.hasOwnProperty(t)) {
							arr.push([parseInt(t), response.resid[t]])
						}
					}
					response.resid = arr;
				}
				return response;
			});
	}

	static async getScenarios({proctype = 'OU', kappa = 1.0, sigma = 2.0, theta = 0.0, x_0 = 1.0, x_0_date = new Date().getTime(), nsteps = 1560} = {}) {
		const date = moment.utc(x_0_date).format(DATE_FORMAT)
		return await Bluecrowe._request({path: 'data/get_scenarios', data: JSON.stringify({proctype, kappa, sigma, theta, x_0, x_0_date: date, nsteps})})
			.then((response) => JSON.parse(response))
			.then((response) => {
				const data = {};
				for(let elm in response) {
					let arr = []
					for(let t in response[elm]) {
						if(response[elm].hasOwnProperty(t)) {
							arr.push([parseInt(t), response[elm][t]])
						}
					}
					data[elm] = arr;
				}
				return data
			})
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