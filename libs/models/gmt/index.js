var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	_id: {
		type: Number,
		require: true,
	},
	time: {
		type: Number,
		min: -12,
		max: 12,
		unique: true,
		require: true,
	},
}, {
		versionKey: false,
		autoIndex: false
	})

exports.GMT = mongoose.model(config.get('db:prefix') + 'GMT', schema)
