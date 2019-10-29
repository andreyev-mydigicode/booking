var mongoose = require('mongoose')

var config = require('../config')
var log = require('../log')(module)

mongoose.Promise = require('bluebird')
mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'), err => {
	if (err) return log.error('no connection to the database')
	else log.info('complite mongoose DB config')
})

module.exports = mongoose
