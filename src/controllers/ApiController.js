const Bluecrowe = require('../services/bluecrowe');
const Alphavantage = require('../services/alphavantage');
const Timeseries = require('../models/timeseries');
const UserHistory = require('../models/userhistory');

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
			const results =  await Timeseries.findOne(query).exec();
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
			const {name, ts, source} = req.body;

			const fit = await Bluecrowe.getFit(ts);

			const timeSeries = new Timeseries({
				name,
				source,
				fit: Object.assign(fit, {start_date: ts[0][0], end_date: ts[ts.length - 1][0]}),
				ts,
				user
			})
			const userHistory = new UserHistory({
				action: 'ADD_LIBRARY',
				meta: source,
				user
			});
			await userHistory.save();
			res.send(await Timeseries.create(timeSeries));
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
  async library (req, res) {
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
			select: '-ts -fit'
    }
		try {
			const results = await Timeseries.page(query, options)
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to paginate library ' + e
      })
		}
	},

	async userHistory (req, res) {
		const {user} = req;
		const {page, pageSize} = req.query

		const query = {
			user: user._id
    }

    const options = {
			page: page,
			limit: parseInt(pageSize),
			sort: { 
				created: -1 
			}
    }
		try {
			const results = await UserHistory.page(query, options)
			res.send(results);
		}
		catch(e) {
			console.log(e)
			res.status(500).send({
        error: 'An error has occured trying to paginate user history' + e
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
			const userHistory = new UserHistory({
				action: 'REMOVE_LIBRARY',
				user
			});
			await userHistory.save();
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