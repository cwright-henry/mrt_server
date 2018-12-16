const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fittingSchema = new Schema({
}, {
	discriminatorKey: 'proctype', 
	_id: false 
})

module.exports = fittingSchema;