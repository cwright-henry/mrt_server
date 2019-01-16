const Timeseries = require('../models/timeseries');
const Strategy = require('../models/strategies');
const UserHistory = require('../models/userhistory');
const Dictionary = require('../models/Dictionary');
const Investing = require('../services/investing');
const Alphavantage = require('../services/alphavantage');

module.exports = { 
	/**
	 * Retreve the full strategy and populate the ts reference
	 * 
	 * @param {Request} req 
	 * @param {Response} res 
	 */
	async findStrategy(req, res) {
		const {user} = req;
		const {strategyId} = req.query;

		const query = {
			_id: strategyId, 
			user: user._id
		};

		res.send(await Strategy.findOne(query).lean().exec());
	},
	
	/**
	 * Create a strategy from the upload time series
	 * TODO error handling...
	 * 
	 * 1. Associate with a strategy with timeseries
	 * 2. Set the default fit process to NONE
	 * 3. Add an entry for user history
	 * 
	 * @param {Request} req contains name, timeseries data, and the source, CVS, AV or other
	 * @param {Response} res Set the strategy on the response
	 */
	async upload(req, res) {
		const {user} = req;
		const {name, data, source} = req.body;

		const userHistory = new UserHistory({
			action: 'ADD_LIBRARY',
			meta: source,
			user: user._id
		});
		await userHistory.save();

		const strategy = new Strategy({
			name,
			source,
			fit: {
				proctype: 'NONE'
			},
			ts: {
				source,
				data
			},
			user: user._id
		})

		res.send(await strategy.save());
	},

	/**
	 * Access to the library of strategies is paginated, pagination
	 * is provided by a pagination plugin
	 * 
	 */
  async listStrategies (req, res) {
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
			select: '-fit -ts',
			lean: true
    }
		
		res.send(await Strategy.paginate(query, options));
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
		
		res.send(await UserHistory.page(query, options));
	},
	
	/**
	 * Remove a strategy and underlying timeseries.
	 * Becarefull of the double click so make sure the strategy exists before
	 * deleting underlying timeseries
	 * 
	 * @param {Request} req 
	 * @param {Response} res 
	 */
	async remove (req, res) {
		const {user} = req;
		const {id} = req.body

		const query = {
			_id: id, 
			user: user._id
		};
		
		const strategy =  await Strategy.findOneAndDelete(query).exec();
		if(strategy) {
			const userHistory = new UserHistory({
				action: 'REMOVE_LIBRARY',
				user
			});
			await userHistory.save();
		}
		res.send(strategy);
	},
	
	async saveOUFit (req, res) {
		const {user} = req;
		const {id, fit} = req.body;

		const query = {
			_id: id, 
			user: user._id
		}

		const update = {
			lastUpdate: Date.now(),
			fit: fit
		}
		res.send(await Strategy.findOneAndUpdate(query, update, {new: true}).exec());
	},

	/**
	 * Retrieve a dictionary either from the existing library or
	 * preconfigured library
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async listDictionary (req, res) {
		const {user} = req;
		const {type} = req.query

		if(type === 'library') {
			let query = {
				user: user._id
			};
			res.send(await Strategy.find(query).select('_id name').sort({name: 'asc'}).lean().exec());
		}
		else {
			let query = {
				type
			};
			res.send(await Dictionary.find(query).sort({name: 'asc'}).lean().exec());
		}
	},

	/**
	 * Find the series from a given source
	 * 
	 * Sources:
	 * 1. Library - extract series from strategy
	 * 2. Investing.com - index, commodities, currency, crypto's
	 * 3. Alphavantage - equities
	 * 
	 * (2, 3) are cached timeseries, so check cache first
	 * 
	 * TODO exception handling
	 * 
	 */
	async findTimeseries (req, res) {
		const {user} = req;
		const {type, source} = req.query;

		if(source === 'Library') {
			let query = {
				user: user._id,
				_id: type
			};

			let select = {
				fit: 0,
				_id: 0,
				user: 0
			}
			res.send(await Strategy.findOne(query).select(select).exec());
		}
		else {
			// Look up cache first
			let query = {
				name: type
			};
			let series = await Timeseries.findOne(query).lean().exec()
			if(series) {
				res.send(series)
			}
			// Not in cache, so look it up
			else {
				if(source === 'Investing.com') {
					let results =  await Investing.get(type);
					let series = new Timeseries({
						name: type,
						source,
						data: results
					})
					series.save();
					res.send(series)
				}
				else {
					let results =  await Alphavantage.get(type);
					if(results.length > 0) {
						let series = new Timeseries({
							name: type,
							source,
							data: results
						})
						series.save();
						res.send(series)
					}
				}
			}
		}
	}
}