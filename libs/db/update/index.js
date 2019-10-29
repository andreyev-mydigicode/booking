var ObjectID = require('mongodb').ObjectID
var log = require('../../log')(module)

function updateById(model, req, cb) {
	log.info('updateById ' + req.id)
	try {
		var id = new ObjectID(req.id)
	} catch (error) {
		return next(error)
	}
	model.findById(id, (err, results) => {
		if (err) return next(err)
		if (!results) return next(new HttpError(404, 'not found'))

		for (let key in results) {
			if (req.body[key]) results[key] = req.body[key]
		}

		return results.save(err => {
			if (!err) {
				log.info('updated the field by id = ' + results._id)
				return res.json(results)
			} else {
				log.error('Internal error: %s', err.message)
				if (err.name == 'ValidationError') return next(new HttpError(400, 'Validation error'))
				else return next(new HttpError(500, 'Server error'))
			}
		})
	})
}

function updateByEmail(model, req, cb) {
	log.info('updateByEmail: ' + req.email)
	model.findOne({ email: req.email }, (err, result) => {
		if (err) cb(err)
		if (!result) cb(new HttpError(404, 'not found'))

		for (let key in req) {
			result[key] = req[key]
		}

		result.save(err => {
			if (err) {
				log.error('Internal error(%d): %s', res.statusCode, err.message)
				if (err.name == 'ValidationError') cb(new HttpError(400, 'Validation error'))
				else cb(new HttpError(500, 'Server error'))
			} else cb()
		})
	})
}

exports.updateById = updateById
exports.updateByEmail = updateByEmail
