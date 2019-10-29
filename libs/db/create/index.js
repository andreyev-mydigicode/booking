var log = require('../../log')(module)
var HttpError = require('../../error').HttpError

function create(model, body, cb) {
	log.info('create')
	body.set_currency = ''
	let m = new model(body)
	m.save(err => cb(err))
}

exports.create = create
