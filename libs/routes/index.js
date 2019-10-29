var async = require('async')
var moment = require('moment')
const nodemailer = require('nodemailer')
var crypto = require('crypto')
var path = require('path')
var fs = require('fs')

var HttpError = require('../error').HttpError
var log = require('../log')(module)
var config = require('../config')

module.exports = (app) => {

	let list = require('../db/get').list
	let list_and_count = require('../db/get').list_and_count
	let list_Users_and_count = require('../db/get').list_Users_and_count
	let list_EndPoints_and_count = require('../db/get').list_EndPoints_and_count
	let getById = require('../db/get').getById
	let getMeetingsById = require('../db/get').getMeetingsById
	let login = require('../db/login').login

	let ObjectID = require('mongodb').ObjectID

	let Meeting = require('../models/meeting').Meeting
	let User = require('../models/user').User
	let End_Point = require('../models/end_point').End_Point
	let getPopulateByModelId = require('../db/get').getPopulateByModelId

	/*
	app.route('*')
		.all((req, res, next) => {
			login(req, res, next, User, (err, result) => {
				if (err) next(err)
				else next()
			})
		})
	*/
	app.route('/auth')
		.get((req, res, next) => {
			getPopulateByModelId(User, req.session.user)
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
						return next(403)
					}
					res.cookie('login', true)
					let dictionary
					let path_str = path.join(__dirname, `../../res/lang/${results.lang.name}.json`)
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
					return next(err)
				})
		})

	app.route('/login')
		.post((req, res, next) => {
			if (req.body.email && req.body.password) {
				User.findOne({ email: req.body.email })
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
							return next(401)
						} else if (!results.confirmation) {
							req.session.destroy()
							res.cookie('login', false)
							res.clearCookie('sid')
							return next(403)
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
							return next(403)
						}
					})
					.catch(err => {
						req.session.destroy()
						res.cookie('login', false)
						res.clearCookie('sid')
						next('err')
					})

			} else return next(403)
		})

	app.route('/logout')
		.get((req, res, next) => {
			if (req.session) {
				req.session.destroy()
				res.cookie('login', false)
				res.clearCookie('sid')
				res.redirect('/')
			}
			else next()
		})

	app.route('*').all((req, res, next) => {
		login(req, res, next, User, (err, result) => {
			if (err) next(err)
			else next()
		})
	})

	app.route(['/meetings/view/:id', '/meetings/edit/:id', '/meetings/:id'])
		.get(async (req, res, next) => {
			let options = {
				id: req.params.id
			}
			let result = JSON.parse(JSON.stringify(await getMeetingsById(Meeting, options)))
			let resSend = {}
			if (result.meeting_days)
				for (let item of result.meeting_days) {
					if (item._id == options.id) {
						resSend['access'] = result.access
						resSend['repeat_id'] = result._id
						resSend['repeat_days'] = result.repeat_days
						resSend['repeat_start_day'] = result.repeat_start_day
						resSend['repeat_end_day'] = result.repeat_end_day
						let ms = moment([item.date, item.time_start].join(' '), 'MM.DD.YYYY HH:mm')
						let me = moment(ms).add(item.duration, 'minutes')
						let mcur = moment()
						resSend['open'] = ms > mcur ? 0 : mcur < me ? 1 : 2
						resSend = { ...resSend, ...item }
						break
					}
				}
			res.json(resSend)
		})

	app.route('/:url')
		.get(async (req, res, next) => {
			if (req.params.url == 'users') {
				log.debug(req.url)
				if (req.query.type || req.query.search) {
					if (req.query.search == '') {
						let data
						let elementsInPage = config.get('site:elementsInSearchPage')
						let options = {}
						if (req.query.page) {
							options['sort'] = {}
							options.sort['skip'] = req.query.page * elementsInPage - elementsInPage
							options.sort['limit'] = elementsInPage
						} else {
							options['sort'] = {}
							options.sort['limit'] = elementsInPage
						}
						switch (req.query.type) {
							case 'person':
								options['fields'] = [
									'fname',
									'lname',
									'email',
									'confirmation',
									'active',
									'role',
									'country',
									'company',
									'phone',
									'zip',
									'gmt',
									'lang',
									'video_record',
									'yt_record',
									'fb_record',
									'webinar_record',
									'audio_record',
									'created',
									'type'
								]
								data = await list_Users_and_count(User, options)
								break
							case 'end_points':
								options['fields'] = [
									'display_name',
									'h323',
									'sip',
									'active',
									'role',
									'country',
									'company',
									'siret',
									'zip',
									'gmt',
									'bandwidth',
									'created',
									'type'
								]
								data = await list_EndPoints_and_count(End_Point, options)
								break
							default:
								next(404)
								break
						}
						res.json({ data: data[0], pages: Math.ceil(data[1] / elementsInPage, 0) })
					} else if (req.query.search != '') {
						let elementsInPage = config.get('site:elementsInSearchPage')
						let sort
						let options = {
							question: {
								$or: [
									{
										fname: {
											$regex: '.*' + req.query.q + '.*',
											$options: 'ixm'
										}
									},
									{
										lname: {
											$regex: '.*' + req.query.q + '.*',
											$options: 'ixm'
										}
									},
									{
										email: {
											$regex: '.*' + req.query.q + '.*',
											$options: 'ixm'
										}
									}
								]
							}
						}

						options['fields'] = [
							'fname',
							'lname',
							'email',
							'confirmation',
							'active',
							'role',
							'country',
							'company',
							'phone',
							'zip',
							'gmt',
							'lang',
							'video_record',
							'yt_record',
							'fb_record',
							'webinar_record',
							'audio_record',
							'created',
							'type'
						]

						options.sort = {
							sort: {
								lname: 1,
								fname: 1
							}
						}

						if (req.query.page) {
							options.sort['skip'] = req.query.page * elementsInPage - elementsInPage
							options.sort['limit'] = elementsInPage
						}

						let data = await list_Users_and_count(User, options)
						res.json({ data: data[0], pages: Math.ceil(data[1] / elementsInPage, 0) })
					}
				} else {
					log.debug('* ' + req.params[0] + req.params[1])
					log.debug('get index.html')
					if (req.params.url.indexOf('.') != -1) res.sendFile(path.join(__dirname, '../../dist/' + req.params.url))
					else res.sendFile(path.join(__dirname, '../../dist/index.html'))
				}
			} else next()
		})
}
