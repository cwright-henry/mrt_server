const Executor = require('./execute')
const User = require('../models/users');

if (process.argv.length === 2) {
    console.error('Please provide email of user!');
    process.exit(1);
}

const email = process.argv[2]

Executor.execute(resetPassword)

async function resetPassword() {
    try {
        const user = await User.findByEmail(email)
        if (!user) {
            console.log(`Unable to find user with email ${email}`)
            process.exit(1);
        }
        const hash = await User.createHash('12345678')

        await User.findOneAndUpdate({
            _id: user._id
        }, {
            password: hash,
        }).exec();

        console.log(`Password updated for ${email}`)
    }
    catch (e) {
        console.log(e)
        process.exit(1);
    }
    process.exit();
}
