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
		const { user } = req;
		const { strategyId } = req.query;

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
		const { user } = req;
		const { name, data, source } = req.body;

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

	async searchStrategies(req, res) {
		const { user } = req;
		const { nameFilter } = req.query
		const query = {
			user: user._id,
			name: new RegExp(nameFilter, "i")
		}
		const options = {
			page: 1,
			limit: 50000,
			sort: {
				name: 1
			},
			select: '-fit -ts',
			lean: true
		}

		res.send(await Strategy.paginate(query, options));
	},

	/**
	 * Access to the library of strategies is paginated, pagination
	 * is provided by a pagination plugin
	 * 
	 * Page: The current page, start at 1
	 * PageSize: Number of items to retrieve
	 * strategyIds: Optional list strategy's to only consider
	 */
	async listStrategies(req, res) {
		const { user } = req;
		const { page, pageSize, overrides } = req.query
		const query = {
			user: user._id
		}
		const strategyOverrides = JSON.parse(overrides) // Need JOI to do this for us
		if (strategyOverrides.length > 0) {
			query._id = { $in: strategyOverrides }
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

	/**
	 * Return a list of login activity
	 */
	async userHistory(req, res) {
		const { user } = req;
		const { page, pageSize } = req.query

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

		res.send(await UserHistory.paginate(query, options));
	},

	/**
	 * Remove a strategy and underlying timeseries.
	 * Becarefull of the double click so make sure the strategy exists before
	 * deleting underlying timeseries
	 * 
	 * @param {Request} req 
	 * @param {Response} res 
	 */
	async remove(req, res) {
		const { user } = req;
		const { id } = req.body

		const query = {
			_id: id,
			user: user._id
		};

		res.send(await Strategy.findOneAndDelete(query).exec());
	},

	async saveOUFit(req, res) {
		const { user } = req;
		const { id, fit, name } = req.body;

		const query = {
			_id: id,
			user: user._id
		}

		const update = {
			lastUpdate: Date.now(),
			fit: fit,
			name,
		}
		res.send(await Strategy.findOneAndUpdate(query, update, { new: true }).exec());
	},

	/**
	 * Retrieve a listing of the users library
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async getLibrary(req, res) {
		const { user } = req;

		let query = {
			user: user._id
		};

		res.send(await Strategy.find(query).select('_id name lastUpdate').sort({ lastUpdate: 'desc' }).lean().exec());
	},

	/**
	 * Find the series from a given source
	 * 
	 * Sources:
	 * 1. Library - extract series from strategy
	 * 2. Investing.com - 'Index', 'Cmdty', 'Curncy', 'Crypto'
	 * 3. Alphavantage - 'Equity'
	 * 
	 * (2, 3) are cached timeseries, so check cache first
	 * 
	 */
	async findTimeseries(req, res) {
		const { user } = req;
		let { ticker, assetClass } = req.query;

		if (assetClass === 'Library') {
			const query = {
				user: user._id,
				_id: ticker
			};

			const select = {
				fit: 0,
				_id: 0,
				user: 0
			}
			return res.send(await Strategy.findOne(query).select(select).exec());
		}

		// Convert ticker to uppercase - seems to be what bloomberg and
		// other providers do
		ticker = ticker.toUpperCase();

		if (assetClass === 'Equity') {
			const query = {
				name: ticker,
				source: assetClass
			};

			// Check the cache
			let series = await Timeseries.findOne(query).lean().exec()

			if (series) {
				return res.send(series)
			}
			else {
				const results = await Alphavantage.get(ticker);
				if (results.length > 0) {
					series = new Timeseries({
						name: ticker,
						source: assetClass,
						data: results
					})
					series.save();
					return res.send(series)
				}
			}
		}

		if (assetClass === 'Index' || assetClass === 'Cmdty' || assetClass === 'Curncy' || assetClass === 'Crypto') {
			const query = {
				name: ticker,
				type: assetClass
			};
			const dictionaryEntry = await Dictionary.findOne(query).lean().exec()

			if (dictionaryEntry) {
				const query = {
					name: ticker,
					source: assetClass,
				};

				// Check the cache
				let series = await Timeseries.findOne(query).lean().exec()
				if (series) {
					return res.send(series)
				}
				else {
					const results = await Investing.get(dictionaryEntry.curr_id);
					series = new Timeseries({
						name: ticker,
						source: assetClass,
						data: results
					})
					series.save();
					return res.send(series)
				}
			}
		}

		return res.status(404).send({ code: 'UNKNOWN_TICKER' })
	},

	/**
	 * Retrieve all tickers from the Dictionary
	 */
	async getTickers(req, res, next) {
		const tickers = await Dictionary.find({});
		return res.status(200).json({
			data: tickers
		});
	}
}