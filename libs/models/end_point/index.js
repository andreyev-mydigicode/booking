var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	display_name: {
		type: String,
		required: true,
	},
	h323: {
		type: String,
		required: true,
	},
	sip: {
		type: String,
		unique: true,
		required: true,
	},
	active: {
		type: Boolean,
		default: false,
	},
	country: {
		type: Number,
		ref: config.get('db:prefix') + 'Country',
		required: true,
	},
	company: {
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'Company',
		required: true,
	},
	siret: {
		type: String,
		unique: true,
		required: true,
	},
	zip: {
		type: Number,
		required: true,
	},
	bandwidth: {
		type: Number,
		ref: config.get('db:prefix') + 'Bandwidth',
		required: true,
	},
	gmt: {
		type: Number,
		ref: config.get('db:prefix') + 'GMT',
		required: true,
	},
	type: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now,
	},
}, {
		versionKey: false,
		autoIndex: false
	})

exports.End_Point = mongoose.model(config.get('db:prefix') + 'End_Point', schema)
