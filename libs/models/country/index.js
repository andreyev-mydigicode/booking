var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	_id: {
		type: Number,
		require: true,
	},
	name: {
		type: String,
		unique: true,
		require: true,
	},
	A2: {
		type: String,
		unique: true,
		require: true,
	},
	A3: {
		type: String,
		unique: true,
		require: true,
	}
}, {
		versionKey: false,
		autoIndex: false
	})

exports.Country = mongoose.model(config.get('db:prefix') + 'Country', schema)
