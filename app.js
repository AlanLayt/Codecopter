var server = require("./src/server");
var router = require("./src/router");
var db = require('./src/database/database');
var config = require('./src/config/config')

var handlers = {
		ide : require('./src/ide/ide'),
		gallery : require('./src/galleryHandler'),
		auth : require('./src/twitterAuth')
	};

server.start(config, router.route, db, handlers);
