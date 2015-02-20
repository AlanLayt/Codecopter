var server = require("./server");
var router = require("./router");
var db = require('./database');

var handlers = {
		ide : require('./ideHandler'),
		gallery : require('./galleryHandler'),
		auth : require('./twitterAuth')
	};


server.start(router.route, db, handlers);
