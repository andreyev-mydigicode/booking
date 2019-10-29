var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	_id: {
		type: Number,
		require: true,
	},
	speed: {
		type: Number,
		required: true,
	},
	rate: {
		type: String,
		default: 'Kbps',
		required: true
	}
}, {
		versionKey: false,
		autoIndex: false
	})

exports.Bandwidth = mongoose.model(config.get('db:prefix') + 'Bandwidth', schema)
