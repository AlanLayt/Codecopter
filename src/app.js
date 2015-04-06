var server = require("./server");
var router = require("./router");
var db = require('./database/database');
var config = require('./config/config')

var handlers = {
		ide : require('./controllers/ide'),
		snippets : require('./controllers/snippets'),
		gallery : require('./controllers/galleries'),
		groups : require('./controllers/groups'),
		groups : require('./controllers/users'),
		auth : require('./auth/twitter')
	};


console.log("------- Startup --------");
server.start(config, router.route, db, handlers, function(err){
	console.log("------------------------");
});
