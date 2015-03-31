var twitterConfig = require('./twitterConfig')
module.exports = {
	address : '127.0.0.1',
	dbPort : 27017,
	httpPort : 8888,
	database : 'codeucation',
	//host : '178.62.94.44',
	host : '127.0.0.1',
	auth : {
		twitter : twitterConfig
	}
}
