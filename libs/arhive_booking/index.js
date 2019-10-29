const moment = require('moment')
const async = require('async')

class ArhiveBooking {
	constructor() {
		this.cacheArrs = {}
	}

	async range(startW, startY, endW, endY) {
		let arr_tmp = []
		for (let i = startY; i <= endY; i++) {
			let j = i == startY ? startW : 1
			let end_j = i == endY ? endW : 53
			for (j; j <= end_j; j++)
				if (this.cacheArrs[i][j])
					arr_tmp.push(...this.cacheArrs[i][j])
		}
		return arr_tmp
	}

	async init() {
		let arr_tmp = []
		let question = {}
		let fields = [
			'repeat_start_day',
			'repeat_end_day',
			'hour',
			'_id',
			'meeting_days',
			'subject',
			'time_end',
			'time_start',
			'duration'
		].join(' ')

		const format_DDMMYYYY = 'DD.MM.YYYY'
		const format_MMYYYY = 'MM.YYYY'
		const format_dotMMYYYY = '.MM.YYYY'
		const format_DDMMYYYY_HHmm = 'DD.MM.YYYY-HH:mm'
		const minutes_str = 'minutes'
		const minus = '-'

		let list = require('../db/get').list
		let Meeting = require('../models/meeting').Meeting

		let meetings_arr = await list(
			Meeting,
			{
				question,
				fields
			}
		)

		async.each(meetings_arr,
			(item, cb) => {
				async.each(item.meeting_days,
					(data, cb) => {
						let date_end = moment(
							[data.date, item.time_start].join(minus),
							format_DDMMYYYY_HHmm
						).add(
							item.duration,
							minutes_str
						)
						let data_day = {
							2: data.date,
							6: date_end.format(format_DDMMYYYY),
							5: data.hour,
							0: data._id,
							1: data.subject,
							4: data.time_end,
							3: data.time_start,
							7: moment() < moment([data.date, data.time_start].join(minus), format_DDMMYYYY_HHmm) ? 0 :
								moment() < date_end ? 1 : 2
						}
						const field_name = moment(data.date, format_DDMMYYYY)
						const year = field_name.year()
						const week = field_name.week()

						if (!this.cacheArrs[year])
							this.cacheArrs[year] = {}

						if (!this.cacheArrs[year][week])
							this.cacheArrs[year][week] = []

						this.cacheArrs[year][week].push(data_day)
					},
					(err) => {
						if (err) return err
					}
				)
			},
			(err) => {
				if (err) return err
			}
		)
	}

	get cache() {
		console.log('get cache')
		for (let i of Object.keys(this.cacheArrs)) {
			console.log(i)
			for (let j of Object.keys(this.cacheArrs[i]))
				console.log('	' + j)
		}
	}

	async save_json() {

	}
}

module.exports = ArhiveBooking