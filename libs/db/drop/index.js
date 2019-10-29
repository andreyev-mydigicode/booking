var mongoose = require('../../mongoose')
var log = require('../../log')(module)

function dropDB(cb) {
	log.debug('dropDB')
	mongoose.connection.dropDatabase(cb)
}

async function dropCollection(name) {
	if (typeof name == "string") {
		log.info('dropCollection ' + name)
		return mongoose.connection.dropCollection(name)
	} else {
		log.info('dropCollection')
		return name.collection.drop()
	}
}

exports.dropDB = dropDB
exports.dropCollection = dropCollection
