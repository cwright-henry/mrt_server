const https = require('https')
const querystring = require('querystring');
const cheerio = require('cheerio')
const moment = require('moment')
const InvestingError = require('../errors/InvestingError')

const DATE_FORMAT = "DD/MM/YYYY"
const NUM_MONTHS = -120

class Investing {
	static _request({curr_id, st_date, end_date}) {

		const data = querystring.stringify({
			action: 'historical_data',
			curr_id,
			st_date,
			end_date,
			interval_sec: 'Daily'
		});

		const opts = {
			host: 'uk.investing.com',
			path: '/instruments/HistoricalDataAjax',
			port: 443,
			method: 'POST',
			headers: {
				'Origin': 'http://www.investing.com',
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/51.0.2704.79 Chrome/51.0.2704.79 Safari/537.36',
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': data.length
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
			req.write(data)
			req.on('error', (error) => {
				return reject(error, null);
			});
			req.end();
		});
	}

	static _parse(body) {
		const $ = cheerio.load(body);
		const data = []; 

		$('tbody tr').each(function() {
			let date = $('td:nth-child(1)', this).attr('data-real-value')
			let value = $('td:nth-child(2)', this).attr('data-real-value')
			if(date && value !== 'undefined') {
				data.push([parseInt(date) * 1000, parseFloat(value.replace(',', ''))])
			}
		});

		data.sort((a, b) => {
			if(!!a[0] && !!b[0]) {
				if (a[0] < b[0]) return -1;
				if (a[0] > b[0]) return 1;
			}
			return 0;
		});

		return data;
	}

	static async get(curr_id) {
		try {
			const end_date = moment().format(DATE_FORMAT)
			const st_date = moment().add(NUM_MONTHS, 'months').format(DATE_FORMAT)

			const result = await Investing._request({curr_id, st_date, end_date});
			return await Investing._parse(result)
		}
		catch(error) {
			throw new InvestingError(`${error}`, {curr_id})
		}
	}
}

module.exports = {
	get: Investing.get
}