var server = require("./src/server");
var router = require("./src/router");
var db = require('./src/database/database');
var config = require('./src/config/config')

var handlers = {
		ide : require('./src/ide/ide'),
		snippets : require('./src/snippetHandler'),
		gallery : require('./src/galleryHandler'),
		groups : require('./src/groupHandler'),
		auth : require('./src/twitterAuth')
	};


console.log("------- Startup --------");
server.start(config, router.route, db, handlers, function(err){
	console.log("------------------------");
});
