#! /usr/bin/env node

console.log('Populating collections...')
require('dotenv').config()
const fs = require('fs');
const moment = require('moment');
const Strategy = require('../models/strategies');
const User = require('../models/users');
const UserHistory = require('../models/userhistory');
const Dictionary = require('../models/Dictionary');
const MRT = require('../services/MRT');

// Setup DB connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('connected', init);

const DATE_FORMAT = 'DD/MM/YYYY';

const fileImports = [
	{ path: __dirname + '/mm1.json', dateFomat: DATE_FORMAT, value: 'MR series 1' },
	{ path: __dirname + '/audcad.json', dateFomat: DATE_FORMAT, value: 'AUDCAD' },
	{ path: __dirname + '/eufly.json', dateFomat: DATE_FORMAT, value: 'EUFLY_RV' },
	{ path: __dirname + '/ewavsewc.json', dateFomat: DATE_FORMAT, value: 'EWAvsEWC' },
	{ path: __dirname + '/gefly.json', dateFomat: DATE_FORMAT, value: 'GE210530' },
	{ path: __dirname + '/mm3.json', dateFomat: DATE_FORMAT, value: 'MR series 3' }
];

const InvestImports = __dirname + '/investingtickerdict.csv';

function parseFile(path, dateFormat, value) {
	return new Promise(function (resolve, reject) {
		fs.readFile(path, 'utf8', (err, contents) => {
			if (err) {
				return reject(err);
			}
			else {
				let data = JSON.parse(contents)
					.filter((item) => {
						const d = moment.utc(item.Date, dateFormat, true);
						const v = item[value];
						return v !== '' && !isNaN(v) && d.isValid();
					})
					.map((item) => {
						const m = moment.utc(item.Date, dateFormat);
						const d = m.valueOf();
						const v = item[value];
						return [d, v];
					})
					.sort((a, b) => {
						if (!!a[0] && !!b[0]) {
							if (a[0] < b[0]) return -1;
							if (a[0] > b[0]) return 1;
						}
						return 0;
					});

				console.log(`Parsed ${path} ...`);
				return resolve({ name: value, data: data });
			}
		});
	});
}

function parseInvestingFile(path) {
	return new Promise(function (resolve, reject) {
		fs.readFile(path, 'utf8', (err, contents) => {
			if (err) {
				return reject(err);
			}
			else {
				const lines = contents.split(/\r\n|\n/);
				const entries = [];
				for (let i = 0; i < lines.length; i++) {
					let data = lines[i].split(',')
					entries.push({
						name: data[0].trim(),
						curr_id: data[1].trim(),
						type: data[2].trim(),
						source: 'Investing.com'
					})
				}

				console.log(`Parsed ${path} ...`);
				return resolve(entries);
			}
		});
	});
}

function createDictionary({ name, curr_id, type, source }) {
	const dictionary = new Dictionary({
		name: name.toUpperCase(),
		curr_id,
		type,
		source
	})
	return Dictionary.create(dictionary);
}

function createUser(firstName, lastName, email, password) {
	const newUser = new User({
		firstName,
		lastName,
		email,
		password
	})
	return User.create(newUser);
}

function createUserHistory(action, meta, user) {
	const userHistory = new UserHistory({
		action,
		meta,
		user
	})
	return userHistory.save();
}

function createStrategy(name, ts, user) {
	const strategy = new Strategy({
		name,
		fit: {
			proctype: 'NONE'
		},
		ts: {
			data: ts
		},
		user
	});

	return strategy.save();
}

/**
 * Deprecated - using dropDatabase instead
 */
function dropCollection() {
	return new Promise((resolve, reject) => {
		db.dropCollection('timeseries', (err, result) => {
			db.dropCollection('user_histories', (err, result) => {
				db.dropCollection('users', (err, result) => {
					if (err) return reject(err);
					console.log(`Dropped timeseries, user_history and user collections ...`);
					return resolve(result);
				});
			});
		});
	});
}

/**
 * Deprecated - imported with proctype = NONE
 */
function fit(series) {
	return new Promise((resolve, reject) => {
		const p = [];
		series.forEach(item => {
			p.push(MRT.getFit({ ts: item.data }));
		});
		Promise.all(p)
			.then(results => {
				results.forEach((elm, index) => {
					series[index].fit = results[index];
				});
				console.log(`Fitted series ...`);
				return resolve(series);
			})
			.catch(error => {
				return reject(error)
			});
	});
}

function parseFiles() {
	const p = [];
	fileImports.forEach((file) => {
		p.push(parseFile(file.path, file.dateFomat, file.value));
	});
	return Promise.all(p)
}

function saveStrategies(series, user, index) {
	return new Promise((resolve, reject) => {
		const p = [];
		series.forEach(item => {
			p.push(createStrategy(index ? (item.name + index) : item.name, item.data, user));
			p.push(createUserHistory('ADD_LIBRARY', 'AUTO_POOPULATE', user));
		});
		Promise.all(p)
			.then(() => resolve())
			.catch(error => {
				return reject(error)
			});
	});
}

async function saveIvestingTickers() {
	let data = await parseInvestingFile(InvestImports)
	for (let i = 0; i < data.length; i++) {
		createDictionary(data[i]);
	}
}

async function init() {
	console.log(`Connected to Mongo ...`);
	const time = process.hrtime();
	try {
		mongoose.connection.dropDatabase();
		saveIvestingTickers();
		const userMark = await createUser('Mark', 'Scrowston', 'mark@mrt.io', '12345678');
		const userColin = await createUser('Colin', 'Wright', 'colin@mrt.io', '12345678');
		const series = await parseFiles();

		await saveStrategies(series, userMark);
		await saveStrategies(series, userColin);
		// for(let i = 0; i < 10; i++) {
		// 	await saveStrategies(series, userColin, `_${i}_colin_duplicate`);
		// }
		// for(let i = 0; i < 10; i++) {
		// 	await saveStrategies(series, userMark, `_${i}_mark_duplicate`);
		// }
		const diff = process.hrtime(time);
		const nanoseconds = (diff[0] * 1e9) + diff[1];
		const seconds = nanoseconds / 1e9;

		console.log(`Import success in ${seconds} seconds`);
	}
	catch (error) {
		console.log(error)
	}
	process.exit();
}