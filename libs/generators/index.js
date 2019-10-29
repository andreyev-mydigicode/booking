function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min
}

function getFalseTrue() {
	if (getRandomInt(0, 2) == 0) return false
	else return true
}

function makeWord(s, e) {
	var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < getRandomInt(s, e); i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length))

	return text
}

function getRepeatDays() {
	var text = ''
	var possible = '1234567'
	var rd = possible.charAt(Math.floor(Math.random() * possible.length))
	for (var i = 0; i < getRandomInt(1,7); i++)
		if (i != 0) {
			let nrd = possible.charAt(Math.floor(Math.random() * possible.length))			
			if( nrd > rd ) {
				rd = nrd
				if(rd > 7) return text
				text += ','
				text += rd
			} else {
				rd ++
				if(rd > 7) return text
				text += ','
				text += rd
			}
		} else
			text += rd
	return text
}

exports.getRandomInt = getRandomInt
exports.getFalseTrue = getFalseTrue
exports.makeWord = makeWord
exports.getRepeatDays = getRepeatDays
