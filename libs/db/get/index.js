var ObjectID = require('mongodb').ObjectID
var log = require('../../log')(module)
var HttpError = require('../../error').HttpError

async function list(model, req) {
	log.info('list')
	return model.find(req.question, req.fields, req.sort)
}

async function list_and_count(model, req) {
	log.info('list_and_count')
	let data = await model.find(req.question, req.fields, req.sort)
	let count = await model.countDocuments(req.question)
	return [data, count]
}

async function list_Users_and_count(model, req) {
	log.info('list_Users_and_count')
	let data = await model.find(req.question, req.fields, req.sort).populate('role').populate('country').populate('company').populate('gmt').populate('lang')
	let count = await model.countDocuments(req.question)
	return [data, count]
}

async function list_EndPoints_and_count(model, req) {
	log.info('list_EndPoints_and_count')
	let data = await model.find(req.question, req.fields, req.sort).populate('country').populate('company').populate('gmt').populate('bandwidth')
	let count = await model.countDocuments(req.question)
	return [data, count]
}

async function getById(model, req) {
	log.info('getById: ' + req.id)
	try {
		var id = new ObjectID(req.id)
	} catch (error) {
		return error
	}
	return model.findById(id, req.fields)
}

async function getMeetingsById(model, req) {
	log.info('getMeetingsById: ' + req.id)
	try {
		var id = new ObjectID(req.id)
	} catch (error) {
		return error
	}
	let fields = [
		"access",
		"_id",
		"fname",
		"lname",
		"email",
	].join(' ')
	return model.findOne({ 'meeting_days._id': id }, req.fields)
		.populate('meeting_days.user', fields)
		.populate('meeting_days.user_list', fields)
		.populate('meeting_days.guest_list', fields)
}

async function getPopulateByModelId(model, id) {
	log.info('getPopulateByModelId')
	try {
		var id = new ObjectID(id)
	} catch (error) {
		return error
	}
	return model.findById(id).populate('role').populate('country').populate('company').populate('gmt').populate('lang')
}

exports.list = list
exports.getById = getById
exports.getMeetingsById = getMeetingsById
exports.list_and_count = list_and_count
exports.getPopulateByModelId = getPopulateByModelId
exports.list_Users_and_count = list_Users_and_count
exports.list_EndPoints_and_count = list_EndPoints_and_count
