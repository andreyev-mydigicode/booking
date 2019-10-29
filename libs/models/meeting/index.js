var mongoose = require('../../mongoose')
var config = require('../../config')

var Schema = mongoose.Schema

var MeetingDays = new Schema({
	week: {
		type: Number
	},
	year: {
		type: Number
	},
	date: {
		type: String
	},
	duration: {
		type: Number,
		required: true,
	},
	duration_hm: {
		type: String,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'User',
		require: true
	},
	host_pin: {
		type: Number,
	},
	guest_pin: {
		type: Number,
	},
	subject: {
		type: String,
		required: true
	},
	massage: {
		type: String,
	},
	hour: {
		type: Number,
		min: 0,
		max: 23,
	},
	time_start: {
		type: String,
		required: true,
	},
	time_end: {
		type: String,
		required: true,
	},
	user_list: [{
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'User'
	}],
	guest_list: [{
		type: Schema.Types.ObjectId,
		ref: config.get('db:prefix') + 'User'
	}]
}, {
		versionKey: false,
		autoIndex: false
	})

var schema = new Schema({
	access: {
		type: Boolean,
		default: false,
	},
	created: {
		type: Date,
		default: Date.now,
	},
	repeat_days: {
		type: String
	},
	repeat_start_day: {
		type: String
	},
	repeat_end_day: {
		type: String
	},
	meeting_days: [MeetingDays]
}, {
		versionKey: false,
		autoIndex: false
	})

schema.indexes({
	'meeting_days.week': 1, 'meeting_days.year': 1
})
exports.Meeting = mongoose.model(config.get('db:prefix') + 'Meeting', schema)
