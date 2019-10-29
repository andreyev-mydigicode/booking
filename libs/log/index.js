var winston = require('winston')
var ENV = process.env.NODE_ENV

function getLogger(module) {
	let patch = module.filename
		.split('/')
		.slice(-2)
		.join('/')

	const myFormat = winston.format.printf(info => {
		return `${info.timestamp} ${info.level}: ${info.message}`
	})

	return winston.createLogger({
		format: winston.format.combine(
			winston.format.timestamp(),
			myFormat
		),
		transports: [
			new winston.transports.Console({
				level: ENV == 'production' ? 'info' : 'debug',
				handleExceptions: true,
				json: false,
				colorize: true
			}),
			new winston.transports.File({
				filename: 'debug.log',
				level: 'debug',
				handleExceptions: true,
				json: true,
				maxsize: 5242880, // 5MB
				maxFiles: 5
			}),
			new winston.transports.File({
				filename: 'error.log',
				level: 'error',
				handleExceptions: true,
				json: true,
				maxsize: 5242880, // 5MB
				maxFiles: 5
			}),
		],
		exitOnError: false
	})
}

module.exports = getLogger
