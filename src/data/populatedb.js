#! /usr/bin/env node

console.log('Populating collections...')

const fs = require('fs');
const moment = require('moment');
const Timeseries = require('../models/timeseries');
const Users = require('../models/users');
const UserHistory = require('../models/userhistory');
const Bluecrowe = require('../services/bluecrowe');
const config = require('../config/config');

// Setup DB connection
const mongoose = require('mongoose');
const mongoDB = config.db.baseURL;
mongoose.connect(mongoDB, {useNewUrlParser: true, useCreateIndex: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('connected', init);

const DATE_FORMAT = 'DD/MM/YYYY';

const fileImports = [
	{path:__dirname + '/mm1.json', dateFomat: DATE_FORMAT, value:'MR series 1'},
	{path:__dirname + '/audcad.json', dateFomat: DATE_FORMAT, value:'AUDCAD'},
	{path:__dirname + '/eufly.json', dateFomat: DATE_FORMAT, value:'EUFLY_RV'},
	{path:__dirname + '/ewavsewc.json', dateFomat: DATE_FORMAT, value:'EWAvsEWC'},
	{path:__dirname + '/gefly.json', dateFomat: DATE_FORMAT, value:'GE210530'},
	{path:__dirname + '/mm3.json', dateFomat: DATE_FORMAT, value:'MR series 3'}
];

function parseFile(path, dateFormat, value) {
	return new Promise(function(resolve, reject){
		fs.readFile(path, 'utf8', (err, contents) => {
			if(err) {
				return reject(err);
			}
			else {
				let data = JSON.parse(contents)
				.filter((item) => {
					const d = moment.utc(item.Date, dateFormat, true);
					const v = item[value];
					return v !== '' && !isNaN(v)  && d.isValid();
				})
				.map((item) => {
					const m = moment.utc(item.Date, dateFormat);
					const d = m.valueOf();
					const v = item[value];
					return [d, v];
				})
				.sort((a, b) => {
					if(!!a[0] && !!b[0]) {
						if (a[0] < b[0]) return -1;
						if (a[0] > b[0]) return 1;
					}
					return 0;
				});
				
				console.log(`Parsed ${path} ...`);
				return resolve({name:value, data:data});
			}
		});
	});
}

function createUser(firstName, lastName, email, password) {
	const newUser = new Users({
		firstName,
		lastName,
		email,
		password
	})
	return Users.create(newUser);
}

function createUserHistory(action, meta, user) {
	const userHistory = new UserHistory({
		action,
		meta,
		user
	})
	return userHistory.save();
}

function createTimeseries(name, series, user) {
	const ts = new Timeseries({
		name,
		fit: {
			proctype: 'NONE'
		},
		ts:series,
		user
	});
	return Timeseries.create(ts);
}

function dropCollection() {
	return new Promise( (resolve, reject) => {
		db.dropCollection('timeseries', (err, result) => {
			db.dropCollection('user_histories', (err, result) => {
				db.dropCollection('users', (err, result) => {
					if(err) return reject(err);
					console.log(`Dropped timeseries, user_history and user collections ...`);
					return resolve(result);
				});
			});
		});
	});
}

function fit(series) {
	return new Promise((resolve, reject) => {
		const p = [];
		series.forEach(item => {
			p.push(Bluecrowe.getFit({ts:item.data}));
		});
		Promise.all(p)
		.then(results => {
			results.forEach((elm, index) => {
				series[index].fit = results[index];
			});
			console.log(`Fitted series ...`);
			return resolve(series);
		})
		.catch( error => {
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

function saveTimeseries(series, user) {
	return new Promise((resolve, reject) => {
		const p = [];
		series.forEach(item => {
			p.push(createTimeseries(item.name, item.data, user));
			p.push(createUserHistory('ADD_LIBRARY', 'AUTO_POOPULATE', user));
		});
		Promise.all(p)
		.then(() => resolve())
		.catch( error => {
			return reject(error)
		});
	});
}

async function init() {
	console.log(`Connected to Mongo ...`);
	const time = process.hrtime();
	try {
		await dropCollection();
		const user = await createUser('admin', 'admin', 'admin@mrt.io', '12345678');
		const series = await parseFiles();
		//const series = await fit(data);
		await saveTimeseries(series, user);
		const diff = process.hrtime(time);
		const nanoseconds = (diff[0] * 1e9) + diff[1];
		const seconds = nanoseconds / 1e9;

		console.log(`Import success in ${seconds} seconds`);
	}
	catch(error) {
		console.log(error)
	}
	process.exit();
}