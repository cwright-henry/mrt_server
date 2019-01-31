const AlphavantageError = require('../errors/AlphavantageError')

const https = require('https');
const moment = require('moment');
const dateFormat='YYYY-MM-DD'

class Alphavantage {
	static _request(ticker) {
		const opts = {
			host: 'www.alphavantage.co', 
			path: `/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=full&apikey=${process.env.ALPHAVANTAGE_API_KEY}`,
			port: 443,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		return new Promise((resolve, reject) => {
			let buffers = []

			let req = https.request(opts, (result) => {
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

			req.end();
			req.on('error', (error) => {
				return reject(error, null);
			});
		});
	}

	static async _parse(data) {
		return new Promise((resolve, reject) => {
			let ts = [];
			let tsData = data["Time Series (Daily)"]
			
			for (let date in tsData) {
				let timestamp = moment.utc(date, dateFormat).valueOf()
				let value = parseFloat(tsData[date]["5. adjusted close"]);
				ts.push([timestamp, value])
			}
			
			resolve(ts.reverse()); 
		});
	}

	static async get(ticker) {
		let result;
		try {
			result = await Alphavantage._request(ticker)
			result = await JSON.parse(result)
			if(result && result['Error Message']) {
				if(result['Error Message'].indexOf('Invalid API call') !== -1) {
					throw new AlphavantageError('UNKNOWN_TICKER', result['Error Message'], {ticker}, 400);
				}
				else {
					throw new AlphavantageError('UNKNOWN_ERROR', result['Error Message'], {ticker}, 500);
				}
			}
			else {
				return await Alphavantage._parse(result)
			}
		}
		catch(err) {
			if(!(err instanceof AlphavantageError)) {
				throw new AlphavantageError('UNKNOWN_ERROR', `${err}`, {ticker}, 500)
			}
			else
				throw err;
		}
	}
}

module.exports = {
	get: Alphavantage.get
}