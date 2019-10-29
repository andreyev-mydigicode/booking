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
	}
}, {
		versionKey: false,
		autoIndex: false
	})

exports.Role = mongoose.model(config.get('db:prefix') + 'Role', schema)
