const http = require('http');
const MRTError = require('../errors/MRTError')

const genUUID = () => {
	return parseInt(Math.random().toString().slice(2,18))
}

class MRT {
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
					if(result.statusCode == 200) {
						return resolve(Buffer.concat(buffers)) 
					}
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
		return await MRT._request({path: 'data/all2', data: JSON.stringify({proctype, kappa, sigma, theta, carry, x_T, trans_oneway_stdev})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError(`${error}`, {proctype, kappa, sigma, theta, carry, x_T, trans_oneway_stdev})
			})
	}

	static async getProb({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await MRT._request({path: 'data/prob', data: JSON.stringify({kappa, sigma, theta, carry, x_T})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError(`${error}`, {kappa, sigma, theta, carry, x_T})
			})
	}

	static async getEpnl({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0, trans_oneway_stdev = 0.05} = {}) {
		return await MRT._request({path: 'data/epnl', data: JSON.stringify({kappa, sigma, theta, carry, x_T, trans_oneway_stdev})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError(`${error}`, {kappa, sigma, theta, carry, x_T, trans_oneway_stdev})
			})
	}

	static async getEt({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await MRT._request({path: 'data/et2', data: JSON.stringify({kappa, sigma, theta, carry, x_T})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError(`${error}`, {kappa, sigma, theta, carry, x_T})
			})
	}

	static async getFit({proctype = 'OU', kappa = 'nan', sigma = 'nan', theta = 'nan', start_date = new Date().getTime(), end_date = new Date().getTime(), ts = []} = {}) {
		const data = {};
		for(let i = 0; i < ts.length; i++) {
			const date = ts[i][0]
			const value = ts[i][1]
			data[date] = value;
		}

		return await MRT._request({path: 'data/fit_all', data: JSON.stringify({proctype, kappa, sigma, theta, ts: data, start_date, end_date})})
			.then((response) => JSON.parse(response))
			.then((response) => {
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
			})
			.catch((error) =>  {
				throw new MRTError(`${error}`, {proctype, kappa, sigma, theta, ts: data, start_date, end_date})
			})
	}

	/**
	 * nsteps The number of business days to generate
	 * nwalks The number of timeseries to generate
	 * seed A random 9 digit number
	 * 
	 * Need to get mark to convert string timestamp to integer!!
	 * Assign a unique Id after each call
	 */
	static async getScenarios({proctype = 'OU', kappa, sigma, theta, x_0, x_0_date, nsteps, nwalks=10, seed} = {}) {
		return await MRT._request({path: 'data/get_scenarios', data: JSON.stringify({proctype, kappa, sigma, theta, x_0, x_0_date, nsteps, nwalks, seed})})
			.then((response) => JSON.parse(response))
			.then((response) => {
				const data = [];
				const uuid = genUUID()
				for(let elm in response) {
					let arr = []
					for(let t in response[elm]) {
						if(response[elm].hasOwnProperty(t)) {
							arr.push([parseInt(t), response[elm][t]])
						}
					}
					data.push({id: `${uuid}_${elm}`, data: arr});
				}
				return data
			})
			.catch((error) =>  {
				throw new MRTError(`${error}`, {proctype, kappa, sigma, theta, x_0, x_0_date, nsteps, nwalks, seed })
			})
	}

	static async getBarrierScenarios({kappa = 1.0, sigma = 2.0, theta = 0.0, x_T = 1.0, a_lvl = 0.5, b_lvl = 1.5} = {}) {
		return await MRT._request({path: 'data/get_barrier_scenarios', data: JSON.stringify({kappa, sigma, theta, x_T, a_lvl, b_lvl})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError(`${error}`, {kappa, sigma, theta, x_T, a_lvl, b_lvl})
			})
	}
}

module.exports = {
	getAll: MRT.getAll,
	getProb: MRT.getProb,
	getEpnl: MRT.getEpnl,
	getEt: MRT.getEt,
	getFit: MRT.getFit,
	getScenarios: MRT.getScenarios,
	getBarrierScenarios: MRT.getBarrierScenarios
}