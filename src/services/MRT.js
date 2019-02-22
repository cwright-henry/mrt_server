const http = require('http');
const MRTError = require('../errors/MRTError')

const genUUID = () => {
	return parseInt(Math.random().toString().slice(2,18))
}

const arrayToObject = (ts) => {
	const obj = {};
	if(ts) {
		for(let i = 0; i < ts.length; i++) {
			const date = ts[i][0]
			const value = ts[i][1]
			obj[date] = value;
		}
	}
	return obj
}

class MRT {
	static _request({path, data}) {
		const opts = {
			host: process.env.MRT_HOST, 
			path,
			port: process.env.MRT_PORT,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length,
				'api-key': process.env.MRT_API_KEY
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

	static async getAll({proctype, kappa, sigma, theta, nbeta='nan', carry = 0.1, x_0, trans_oneway_stdev = 0.05} = {}) {
		return await MRT._request({path: 'data/all2', data: JSON.stringify({proctype, kappa, sigma, theta, nbeta, carry, x_0, trans_oneway_stdev})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {proctype, kappa, sigma, theta, carry, x_0, trans_oneway_stdev}, 500)
			})
	}

	static async getProb({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await MRT._request({path: 'data/prob', data: JSON.stringify({kappa, sigma, theta, carry, x_T})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {kappa, sigma, theta, carry, x_T}, 500)
			})
	}

	static async getEpnl({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0, trans_oneway_stdev = 0.05} = {}) {
		return await MRT._request({path: 'data/epnl', data: JSON.stringify({kappa, sigma, theta, carry, x_T, trans_oneway_stdev})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {kappa, sigma, theta, carry, x_T, trans_oneway_stdev}, 500)
			})
	}

	static async getEt({kappa = 1.0, sigma = 2.0, theta = 0.0, carry = 0.0, x_T = 1.0} = {}) {
		return await MRT._request({path: 'data/et2', data: JSON.stringify({kappa, sigma, theta, carry, x_T})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {kappa, sigma, theta, carry, x_T}, 500)
			})
	}

	static async getFit({proctype, kappa='nan', sigma='nan', theta='nan', nbeta='nan', start_date, end_date, ts} = {}) {

		return await MRT._request({path: 'data/fit_all', data: JSON.stringify({proctype, kappa, sigma, theta, nbeta, ts: arrayToObject(ts), start_date, end_date})})
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
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {proctype, kappa, sigma, theta, nbeta, ts: ts.length, start_date, end_date}, 500)
			})
	}


	/**
	 * Take 2 timeseries and fit them using LSpairfit or OU
	 * Need to convert response to an array of arrays [[timestamp, value], [timestamp, value] ...] - highchatrs thing
	 * 
	 * @param {String} proctype Either OU or LSPairfit
	 * @param {Array} ts1 Timeseries
	 * @param {Array} ts2 Timeseries
	 */
	static async getFitLSE({proctype='LSpairfit', ts1, ts2} = {}) {

		return await MRT._request({path: 'data/fit_lse', data: JSON.stringify({proctype, ts: arrayToObject(ts1), ts2: arrayToObject(ts2)})})
			.then((response) => JSON.parse(response))
			.then((response) => {
				if(response.pair_resid) {
					const arr = []
					for(let t in response.pair_resid) {
						if(response.pair_resid.hasOwnProperty(t)) {
							arr.push([parseInt(t), response.pair_resid[t]])
						}
					}
					response.pair_resid = arr;
				}
				return response;
			})
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {proctype, ts1:ts1.length, ts2: ts2.length}, 500)
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
	static async getScenarios({proctype, kappa, sigma, nbeta, theta, x_0, x_0_date, nsteps, nwalks=10, seed} = {}) {
		return await MRT._request({path: 'data/get_scenarios', data: JSON.stringify({proctype, kappa, sigma, theta, nbeta, x_0, x_0_date, nsteps, nwalks, seed})})
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
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {proctype, kappa, sigma, theta, nbeta, x_0, x_0_date, nsteps, nwalks, seed}, 500)
			})
	}

	static async getBarrierScenarios({kappa = 1.0, sigma = 2.0, theta = 0.0, x_T = 1.0, a_lvl = 0.5, b_lvl = 1.5} = {}) {
		return await MRT._request({path: 'data/get_barrier_scenarios', data: JSON.stringify({kappa, sigma, theta, x_T, a_lvl, b_lvl})})
			.then((response) => JSON.parse(response))
			.catch((error) =>  {
				throw new MRTError('UNKNOWN_ERROR', `${error}`, {kappa, sigma, theta, x_T, a_lvl, b_lvl}, 500)
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
	getBarrierScenarios: MRT.getBarrierScenarios,
	getFitLSE: MRT.getFitLSE
}