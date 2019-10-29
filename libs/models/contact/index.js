var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	me: {
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'User'
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'User'
	},
	end_point: {
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'End_Point'
	},
	favorite: {
		type: Boolean,
		required: true,
		default: false,
	},
}, {
		versionKey: false,
		autoIndex: false
	})

exports.Contact = mongoose.model(config.get('db:prefix') + 'Contact', schema)
