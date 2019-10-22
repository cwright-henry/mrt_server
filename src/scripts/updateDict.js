const Executor = require('./execute')
const fs = require('fs');
const Dictionary = require('../models/Dictionary');
const InvestImports = __dirname + '/../data/investingtickerdict.csv';

Executor.execute(updateDict)

async function updateDict(db) {
	try {
		await dropCollection(db);
		let data = await parseInvestingFile(InvestImports)
		for (let i = 0; i < data.length; i++) {
			await createDictionary(data[i]);
		}
		console.log('Success!')
	}
	catch (e) {
		console.log(e)
		process.exit(1);
	}
	process.exit();
}

async function dropCollection(db) {
	return new Promise((resolve, reject) => {
		db.connection.dropCollection('dictionaries', (err, result) => {
			if (err) return reject(err);
			console.log(`Dropped dictionaries collections ...`);
			return resolve(result);
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

async function parseInvestingFile(path) {
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

