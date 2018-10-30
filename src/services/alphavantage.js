const https = require('https');
const moment = require('moment');
const dateFormat='YYYY-MM-DD'

class Alphavantage {
	static _request(ticker) {
		const opts = {
			host: 'www.alphavantage.co', 
			path: `/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=full&apikey=W161`,
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
					if(result.statusCode == 200) 
						return resolve(Buffer.concat(buffers)) 
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
				let timestamp = moment(date, dateFormat).valueOf()
				let value = parseFloat(tsData[date]["5. adjusted close"]);
				ts.push([timestamp, value])
			}
			
			resolve(ts.reverse()); 
		});
	}

	static async get(ticker) {
		let result = await Alphavantage._request(ticker).then((response) => JSON.parse(response));
		return await Alphavantage._parse(result)
	}
}

module.exports = {
	get: Alphavantage.get
}