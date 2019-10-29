var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var path = require('path')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var sharedsession = require('express-socket.io-session')
var MongoStore = require('connect-mongo')(session)
const async = require('async')
var engine = require('ejs-locals')
var fs = require('fs')
const moment = require('moment')
var promise = require('promise')
var http = require('http').createServer(app)
var io = require('socket.io')(http)

var mongoose = require('./libs/mongoose')
var config = require('./libs/config')
var log = require('./libs/log')(module)
var HttpError = require('./libs/error').HttpError
var sendHttpError = require('./libs/error').sendHttpError

app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.engine('ejs', engine)
app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'ejs')

app.set('trust proxy', 1)

var sess = session({
	secret: config.get('session:secret'),
	key: config.get('session:key'),
	saveUninitialized: config.get('session:saveUninitialized'),
	resave: config.get('session:resave'),
	cookie: config.get('session:cookie'),
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		touchAfter: 1 * 60 * 60,
		autoRemove: 'native',
	}),
})
app.use(sess)
io.use(sharedsession(sess, cookieParser(config.get('session:secret'))))

app.use(express.static(path.join(__dirname, '/dist')))

app.route('*').all((req, res, next) => {
	req.url = decodeURI(req.url)
	next()
})

app.route('/').get((req, res, next) => {
	if (req.query.lang) {
		let path_str = `/res/lang/${req.query.lang}.json`
		fs.stat(path.join(__dirname, path_str), (err, stats) => {
			if (err) next(err)
			else if (stats) {
				res.json(JSON.parse(fs.readFileSync('.' + path_str, 'utf8')))
			} else next(409)
		})
	} else next()
})

require('./libs/routes')(app)

app.use((err, req, res, next) => {
	log.error(err)
	if (typeof err == 'number') {
		err = new HttpError(err)
	}
	if (err instanceof HttpError) {
		sendHttpError(err, req, res, next)
	} else {
		err = new HttpError(500)
		sendHttpError(err, req, res, next)
	}
})

app.route('*/:file').get((req, res, next) => {
	log.debug('* ' + req.params[0] + req.params[1])
	log.debug('get index.html')
	if (req.params.file.indexOf('.') != -1) res.sendFile(path.join(__dirname, '/dist/' + req.params.file))
	else res.sendFile(path.join(__dirname, '/dist/index.html'))
})

var arguments = process.argv
http.listen(config.get('server:port'), config.get('server:host'), async err => {
	if (err) return log.error('server could not start listening')
	log.info('the server began to listen')
	log.info('NODE_ENV = ' + app.get('env'))

	var requireModels = require('./libs/db/constructor').requireModels
	requireModels(err => {
		if (err) {
			log.error('error requireModels')
			return next(err)
		}
	})

	for (let arg of arguments) {
		switch (arg) {
			case 'init-db':
				let createCountry = require('./libs/db/constructor').createCountry
				let createRole = require('./libs/db/constructor').createRole
				let createGMT = require('./libs/db/constructor').createGMT
				let createLang = require('./libs/db/constructor').createLang
				let createBandwidth = require('./libs/db/constructor').createBandwidth
				let createCompany = require('./libs/db/constructor').createCompany
				let createMeeting = require('./libs/db/constructor').createMeeting
				let createUsers = require('./libs/db/constructor').createUsers
				let Meeting = require('./libs/models/meeting').Meeting
				let createEndPoints = require('./libs/db/constructor').createEndPoints
				let dropCollection = require('./libs/db/drop').dropCollection
				break
			default:
				break
		}
	}
})

io.on('connection', async socket => {
	const format_DDMMYYYY = 'DD.MM.YYYY'
	const format_MMYYYY = 'MM.YYYY'
	const format_dotMMYYYY = '.MM.YYYY'
	const format_DDMMYYYY_HHmm = 'DD.MM.YYYY-HH:mm'
	const minutes_str = 'minutes'
	const minus = '-'

	socket.on('range', async data => {
		let T1 = new Date()
		let arr_tmp = []
		let question

		let [startW, startY, endW, endY] = [...data]

		let questionArr = []
		if (startY == endY && startW <= endW) {
			questionArr = {
				$and: [
					{ 'meeting_days.week': { $gte: startW } },
					{ 'meeting_days.week': { $lte: endW } },
					{ 'meeting_days.year': { $eq: startY } },
				],
			}
		} else if (startY < endY && startY + 1 == endY) {
			questionArr = {
				$or: [
					{
						$and: [
							{ 'meeting_days.week': { $gte: startW } },
							{ 'meeting_days.week': { $lte: 55 } },
							{ 'meeting_days.year': { $eq: startY } },
						],
					},
					{
						$and: [
							{ 'meeting_days.week': { $gte: 1 } },
							{ 'meeting_days.week': { $lte: endW } },
							{ 'meeting_days.year': { $eq: endY } },
						],
					},
				],
			}
		} else socket.emit('range', [])

		let User = require('./libs/models/user').User
		let userResult = await User.findById(socket.handshake.session.user)

		switch (userResult.role) {
			case 0:
				question = questionArr
				break
			case 1:
				let Company = require('./libs/models/user').Company
				let usersCompanyResult = await User.find({ company: userResult.company }, '_id')
				let UCR = []
				for (let item of usersCompanyResult) UCR.push({ 'meeting_days.user': item._id })
				question = {
					$and: [{ $or: UCR }, questionArr],
				}
				break
			case 2:
				question = {
					$and: [{ 'meeting_days.user': socket.handshake.session.user }, questionArr],
				}
				break
			default:
				return socket.emit('range', [])
				break
		}

		let fields = [
			'repeat_start_day',
			'repeat_end_day',
			'hour',
			'_id',
			'meeting_days',
			'subject',
			'time_end',
			'time_start',
			'duration',
		].join(' ')

		let list = require('./libs/db/get').list
		let Meeting = require('./libs/models/meeting').Meeting

		let result = []
		let meetings_arr = await list(Meeting, {
			question,
			fields,
		})
		let T2 = new Date()
		log.debug('The response time from the base to the "range" socket: ' + (new Date() - T1))
		async.each(
			meetings_arr,
			(item, cb) => {
				async.each(
					item.meeting_days,
					(data, cb) => {
						let date_end = moment([data.date, item.time_start].join(minus), format_DDMMYYYY_HHmm).add(
							item.duration,
							minutes_str,
						)
						let data_day = [
							data._id,
							data.subject,
							data.date,
							data.time_start,
							data.time_end,
							data.hour,
							date_end.format(format_DDMMYYYY),
							moment() < moment([data.date, data.time_start].join(minus), format_DDMMYYYY_HHmm)
								? 0
								: moment() < date_end
									? 1
									: 2,
							data.duration,
						]
						const field_name = moment(data.date, format_DDMMYYYY)
						const year = field_name.year()
						const week = field_name.week()
						result.push(data_day)
					},
					err => {
						if (err) return err
					},
				)
			},
			err => {
				if (err) return err
			},
		)
		log.debug('The time to prepare a response to the "range" socket: ' + (new Date() - T2))
		log.debug('Time to respons soket "range": ' + (new Date() - T1))

		return socket.emit('range', result)
	})
})
