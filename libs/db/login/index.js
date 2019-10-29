var fs = require('fs')
var path = require('path')
var ObjectID = require('mongodb').ObjectID
var log = require('../../log')(module)
var getPopulateByModelId = require('../get').getPopulateByModelId

function login(req, res, next, model, cb) {
	log.info('login ' + req.method + ' ' + req.url)
	if (req.session.user)
		getPopulateByModelId(model, req.session.user)
			.then((results) => {
				if (!results) {
					req.session.destroy()
					res.cookie('login', false)
					res.clearCookie('sid')
					return cb(401)
				} else if (!results.confirmation) {
					req.session.destroy()
					res.cookie('login', false)
					res.clearCookie('sid')
					return cb(403)
				}
				res.cookie('login', true)
				return cb()
			})
			.catch((err) => {
				req.session.destroy()
				res.cookie('login', false)
				res.clearCookie('sid')
				return cb(err)
			})
	else next()
	/*	
	if (req.url == '/login') {
		if (req.body.email && req.body.password) {
			model.findOne({ email: req.body.email })
				.populate('role')
				.populate('country')
				.populate('company')
				.populate('gmt')
				.populate('lang')
				.then(results => {
					if (!results) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(401)
					} else if (!results.confirmation) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(403)
					}
					if (results.checkPassword(req.body.password)) {
						req.session.user = results._id
						res.cookie('login', true)
						res.status(200)
						return res.json(results)
					} else {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(403)
					}
				})
				.catch(err => {
					req.session.destroy()
					res.cookie('login', false)
					res.clearCookie('sid')
					if (err) return cb(err)
					else return cb(403)
				})

		} else return cb()
	} else if (req.session.user)
		if (req.url == '/auth') {
			getPopulateByModelId(model, req.session.user)
				.then((results) => {
					if (!results) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(401)
					} else if (!results.confirmation) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(403)
					}
					res.cookie('login', true)
					let dictionary
					let path_str = path.join(__dirname, `../../../res/lang/${results.lang.name}.json`)
					fs.stat(path_str, (err, stats) => {
						if (err) next(err)
						else if (stats) {
							dictionary = JSON.parse(fs.readFileSync(path_str, 'utf8'))
						}
						else next(409)
						return res.json({ user: results, dictionary })
					})
				})
				.catch((err) => {
					req.session.destroy()
					res.cookie('login', false)
					res.clearCookie('sid')
					return cb(err)
				})
		} else {
			getPopulateByModelId(model, req.session.user)
				.then((results) => {
					if (!results) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(401)
					} else if (!results.confirmation) {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						return cb(403)
					}
					res.cookie('login', true)
					return cb()
				})
				.catch((err) => {
					req.session.destroy()
					res.cookie('login', false)
					res.clearCookie('sid')
					return cb(err)
				})
		}
	else {
		req.session.destroy()
		res.cookie('login', false)
		res.clearCookie('sid')
		return cb(403)
	}
	*/
}

exports.login = login
