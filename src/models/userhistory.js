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
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	created: {
		type: Number,
		default: Date.now
	}
});

UserHistorySchema.plugin(mongoosePaginate)

/**
 * Export the model to create the schema
 */
module.exports = mongoose.model('user_histories', UserHistorySchema);


