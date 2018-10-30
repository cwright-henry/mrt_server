const Bluecrowe = require('../services/bluecrowe');
const Alphavantage = require('../services/alphavantage');
const Timeseries = require('../models/timeseries');
const moment = require('moment');

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
			const result = await Bluecrowe.getAll(payload);
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data All Error = ' + error);
		}
	},
    
	async getProb(req, res) {
		try {
			const result = await Bluecrowe.getProb();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Prob Error = ' + error);
		}
	},
    
	async getEpnl(req, res) {
		try {
			const result = await Bluecrowe.getEpnl();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Enpl Error = ' + error);
		}
	},
		
	async getEt(req, res) {
		try {
			const result = await Bluecrowe.getEt();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Et Error = ' + error);
		}
	},
		
	async getFit(req, res) {
		try {
			const {ts} = req.body;
			const fit = await Bluecrowe.getFit(ts);
			res.send(fit);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Fit Error = ' + error);
		}
	},
		
	async getScenarios(req, res) {
		try {
			const result = await Bluecrowe.getScenarios();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Scenarios Error = ' + error);
		}
	},
		
	async getBarrierScenarios(req, res) {
		try {
			const result = await Bluecrowe.getBarrierScenarios();
			res.send(result);
		}
		catch(error) {
			console.log(error)
			res.status(500).send('Data Barrier Scenarios Error = ' + error);
		}
	},

	async findTs(req, res) {
		try {
			const {user} = req;
			const {timeseriesId} = req.query;

			const query = {
				_id: timeseriesId, 
				user: user
			};
			const results =  await Timeseries.findOne(query).select('ts').exec();
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to upload file ' + e
      })
		}
	},
	
	async upload(req, res) {
		try {
			const {user} = req;
			const {name, ts, fit} = req.body;
			const timeSeries = new Timeseries({
				name,
				fit: Object.assign(fit, {start_date: ts[0][0], end_date: ts[ts.length - 1][0]}),
				ts,
				user
			})

			res.send(Timeseries.create(timeSeries));
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to upload file ' + e
      })
		}
	},

	/**
	 * Limit size of 0 returns only meta data, lazy load the time series
	 */
  async list (req, res) {
		const {user} = req;
		const {page, nameFilter, pageSize} = req.query
    const query = {
			user: user._id,
			name: new RegExp(nameFilter, "i")
    }
    const options = {
			page: page,
			limit: parseInt(pageSize),
			sort: { 
				lastUpdate: -1 
			},
			select: '-ts'
    }
		try {
			const results = await Timeseries.page(query, options)
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to paginate ' + e
      })
		}
	},
	
	async remove (req, res) {
		const {user} = req;
		const {id} = req.body
		try {
			const query = {
				_id: id, 
				user: user
			};
    	const results =  await Timeseries.findOneAndRemove(query).exec();
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to remove ' + e
      })
		}
	},
	
	async find (req, res) {
		const {user} = req;
		const {id} = req.query
		try {
			const query = {
				_id: id, 
				user: user
			};
    	const results =  await Timeseries.findOne(query).exec();
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to remove ' + e
      })
		}
	},
	
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
  }
}