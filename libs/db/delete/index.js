var ObjectID = require('mongodb').ObjectID
var log = require('../../log')(module)

function deleteById(model, req, cb) {
	log.info('deleteById ' + req.url)
	try {
		var id = new ObjectID(req.params.id)
	} catch (error) {
		return next(error + 'sdfsdfds')
	}
	return model.findById(req.params.id, function(err, results) {
		if (!results) return next(new HttpError(404, 'not found'))

		return results.remove(err => {
			if (!err) {
				log.info('deleted the field by id = ' + results._id)
				return res.send({ status: 'OK' })
			} else {
				log.error('Internal error(%d): %s', res.statusCode, err.message)
				return next(new HttpError(500, 'Server error'))
			}
		})
	})
}

exports.deleteById = deleteById
