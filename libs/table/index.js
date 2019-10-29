var moment = require('moment')

const TIME = [
	'00:00',
	'01:00',
	'02:00',
	'03:00',
	'04:00',
	'05:00',
	'06:00',
	'07:00',
	'08:00',
	'09:00',
	'10:00',
	'11:00',
	'12:00',
	'13:00',
	'14:00',
	'15:00',
	'16:00',
	'17:00',
	'18:00',
	'19:00',
	'20:00',
	'21:00',
	'22:00',
	'23:00',
]

class Calendar {

	constructor(data) {
		this.data = data
	}

	state = {
		startDay: moment(),

		mode: 'week',
		success: false,

		// Day
		indexesDay: {},
		columnsDay: [],
		dataSourceDay: [],

		// Week
		indexesWeek: {},
		columnsWeek: [],
		dataSourceWeek: [],

		// Month
		columnsMonth: [],
		dataSourceDay: [],
		dataSourceMonth: [],

		data: [], // Response

		workFlow: true, // Split Columns - Work week
		windowHeight: 0,
	}

	createDay = () => {
		const { data } = this.state

		let meetings = []

		for (let i = 0; i < 24; i++) {
			let indexesDay = this.state.indexesDay
			for (let key of Object.keys(indexesDay)) {
				const finder = data
					.filter(item => item.hour == i)
					.filter(item => item.date == key)
					.sort((a, b) => a.hour > b.hour)
				indexesDay[key] = finder
			}
			meetings = [
				...meetings,
				{
					hour: i,
					time: TIME[i],
					...indexesDay,
				},
			]
		}
		this.setState({
			dataSourceDay: meetings,
		})
	}

	createWeek = () => {
		const { data } = this.state

		let meetings = []

		for (let i = 0; i < 24; i++) {
			let indexesWeek = this.state.indexesWeek
			for (let key of Object.keys(indexesWeek)) {
				const finder = data
					.filter(item => item.hour == i)
					.filter(item => item.date == key)
					.sort((a, b) => a.hour > b.hour)
				indexesWeek[key] = finder
			}
			meetings = [
				...meetings,
				{
					hour: i,
					time: TIME[i],
					...indexesWeek,
				},
			]
		}
		this.setState({
			dataSourceWeek: meetings,
		})
	}

	createMonth = value => {
		const { data } = this.state
		let meetings = []
		let weeks = []
		let startDay = moment(this.state.startDay).startOf('isoweek')

		let start = this.state.data[0].date
		let end = this.state.data[this.state.data.length - 1].date
		let calcWeek = 1000 * 60 * 60 * 24 * 7
		this.offsetTop = Math.floor((moment(this.state.startDay) - moment(start, 'DD.MM.YYYY')) / calcWeek)
		this.offsetBottom = Math.floor((moment(end, 'DD.MM.YYYY') - moment(this.state.startDay)) / calcWeek)

		switch (value) {
			case 'left':
				this.setState({ dataSourceMonth: [] })
				this.fetchMeetings(this.state.startDay)
				this.state.startDay.subtract(1, 'months')
				startDay = moment(this.state.startDay).startOf('isoweek')
				break
			case 'right':
				this.setState({ dataSourceMonth: [] })
				this.fetchMeetings(this.state.startDay)
				this.state.startDay.add(1, 'months')
				startDay = moment(this.state.startDay).startOf('isoweek')
				break
			case 'top':
				if (this.offsetTop <= 3) this.fetchMeetings(startDay)
				this.state.startDay.subtract(1, 'week')
				startDay = moment(this.state.startDay).startOf('isoweek')
				break
			case 'bottom':
				if (this.offsetBottom <= 3) this.fetchMeetings(startDay)
				this.state.startDay.add(1, 'week')
				startDay = moment(this.state.startDay).startOf('isoweek')
				break
		}

		let strDay = startDay.format('DD.MM.YYYY')

		let dayOffset =
			+moment(this.state.startDay)
				.startOf('month')
				.day() - 1

		let countDaysInMonth = moment(this.state.startDay).daysInMonth()

		let countWeeksInMonth = Math.round((dayOffset + countDaysInMonth) / 7)

		for (let i = 1; i <= countWeeksInMonth; i++) {
			let days = [strDay]
			for (let i = 1; i < 7; i++) {
				days = [
					...days,
					moment(strDay, 'DD.MM.YYYY')
						.add(i, 'days')
						.format('DD.MM.YYYY'),
				]
			}
			weeks = [...weeks, days]
			strDay = moment(days[0], 'DD.MM.YYYY')
				.add(7, 'days')
				.format('DD.MM.YYYY')
		}

		for (let array of weeks) {
			let obj = {}
			for (let index in array) {
				let filter = this.state.data.filter(item => item.date == array[index])
				obj = { ...obj, ['day_' + index]: filter.length ? filter : [{ date: array[index] }] }
			}
			meetings = [...meetings, obj]
		}

		this.setState({
			dataSourceMonth: meetings,
		})
	}

}

