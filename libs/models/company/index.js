var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	name: {
		type: String,
		unique: true,
		require: true,
	},
	siret: {
		type: String
	},
	video_record: {
		type: Boolean,
		default: false
	},
	yt_record: {
		type: Boolean,
		default: false
	},
	fb_record: {
		type: Boolean,
		default: false
	},
	webinar_record: {
		type: Boolean,
		default: false
	},
	audio_record: {
		type: Boolean,
		default: false
	}
}, {
		versionKey: false,
		autoIndex: false
	})

exports.Company = mongoose.model(config.get('db:prefix') + 'Company', schema)
