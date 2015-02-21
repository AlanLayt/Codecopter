var server = require("./server");
var router = require("./router");
var db = require('./database/database');
var config = require('./config/config')

var handlers = {
		ide : require('./ideHandler'),
		gallery : require('./galleryHandler'),
		auth : require('./twitterAuth')
	};


console.log(config)
server.start(config, router.route, db, handlers);
