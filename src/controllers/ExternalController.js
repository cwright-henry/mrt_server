const Alphavantage = require('../services/alphavantage');
const Investing = require('../services/investing');
const moment = require('moment')

module.exports = {
	async findAlphavantage (req, res) {
		const {ticker} = req.query;
		try {
			const results =  await Alphavantage.get(ticker);
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error retrieving data from Alphavantage ' + e
      })
		}
	},
	
	async findInvesting (req, res) {
		const {curr_id, startDate, endDate} = req.query;
		try {
			const results =  await Investing.get(curr_id, startDate, endDate);
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error retrieving data from Investing ' + e
      })
		}
	}
}