var crypto = require('crypto')

var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var schema = new Schema({
	fname: {
		type: String,
		required: true,
	},
	lname: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
	},
	confirmation: {
		type: Boolean,
		default: false,
	},
	active: {
		type: Boolean,
		default: false,
	},
	role: {
		type: Number,
		ref: config.get('db:prefix') + 'Role',
		require: true,
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
	phone: {
		type: String,
		required: true,
	},
	zip: {
		type: Number,
		required: true,
	},
	gmt: {
		type: Number,
		ref: config.get('db:prefix') + 'GMT',
		required: true,
	},
	lang: {
		type: Number,
		ref: config.get('db:prefix') + 'Lang',
		required: true,
	},
	hashedPassword: {
		type: String,
		required: true,
		default: '',
	},
	salt: {
		type: String,
		required: true,
		default: '',
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

schema.methods.encryptPassword = function (password) {
	return crypto
		.createHmac('sha1', this.salt)
		.update(password)
		.digest('hex')
}

schema
	.virtual('password')
	.set(function (password) {
		this._plainPassword = password
		this.salt = Math.random() + ''
		this.hashedPassword = this.encryptPassword(password)
	})
	.get(function () {
		return this._plainPassword
	})

schema.virtual('set_currency').set(function () {
	this.currency = 'cash'
})

schema.methods.checkPassword = function (password) {
	return this.encryptPassword(password) === this.hashedPassword
}

exports.User = mongoose.model(config.get('db:prefix') + 'User', schema)
