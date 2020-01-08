const Executor = require('./execute')
const User = require('../models/users');

if (process.argv.length === 2) {
	console.error('Please provide email of user!');
	process.exit(1);
}

const email = process.argv[2]
const role = process.argv[3]

Executor.execute(updateRole)

async function updateRole() {
	try {
		const user = await User.findByEmail(email)
		if (!user) {
			console.log(`Unable to find user with email ${email}`)
			process.exit(1);
		}

		await User.findOneAndUpdate({
			_id: user._id
		}, {
			role: role || 'admin',
			tokenRevoked: false
		}).exec();

		console.log(`Role updated for ${email}`)
	}
	catch (e) {
		console.log(e)
		process.exit(1);
	}
	process.exit();
}