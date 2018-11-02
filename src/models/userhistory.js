const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const UserHistorySchema = new mongoose.Schema({
	action: {
		type: String,
		required: true,
		trim: true
	},
	meta: {
		type: String,
		trim: true,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});

UserHistorySchema.plugin(mongoosePaginate)

/**
 * Export the model to create the schema
 */
module.exports = mongoose.model('user_histories', UserHistorySchema);


