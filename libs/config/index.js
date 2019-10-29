var nconf = require('nconf')
var patch = require('path')

nconf
	.argv()
	.env()
	.file({ file: patch.join(__dirname, 'config.json') })

module.exports = nconf
