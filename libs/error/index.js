var patch = require('path')
var util = require('util')
var http = require('http')

function HttpError(status, message) {
    Error.apply(this, arguments)
    Error.captureStackTrace(this, HttpError)

    this.status = status
    this.message = message || http.STATUS_CODES[status] || 'Error'
}

function sendHttpError(err, req, res, next) {
    res.status(err.status)
    if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
        res.json(err)
    } else {
        res.render('error', { error: err })
    }
}
/*
function error(err, message, req, res, next) {
    if (typeof err == 'number') {
        err = new HttpError(err, message)
    }
    if (err instanceof HttpError) {
        sendHttpError(err, req, res, next)
    } else {
        if (app.get('env') == 'development') {
            app.use(errorhandler()(err, req, res, next))
        } else {
            err = new HttpError(500)
            sendHttpError(err, req, res, next)
        }
    }
}
*/
util.inherits(HttpError, Error)

HttpError.prototype.name = 'HttpError'

exports.HttpError = HttpError
exports.sendHttpError = sendHttpError
//exports.error = error
