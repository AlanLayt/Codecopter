var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');

var httpPort = 7777;

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');



// Start http server,MongoDB, sockets and initialize routing or fail gracefully
var start = function(route, db, handlers) {
	console.log("------- Startup --------");

	db.connect(function(dbm,srv){
		console.log('MONGO: Database found. (Port %d)', srv.port);
		http.listen(httpPort, function(err){

			console.log('HTTP: Server Started. (Port %d)', httpPort);

			handleInit(handlers,db,function(){
				route(app, db, handlers);
				finalizeInit();
			});
		});

	},
	function(err,srv){
		console.error('ERR: Mongo database not found on %s:%d. Exiting.',srv.address, srv.port);
		console.error(err);
		console.error('----');
		finalizeInit();
	});

}

// Depricated Method, contained socket.io events,
// Retained to handle user-related events later
var handleInit = function(handlers,db,callback){
	Object.keys(handlers).forEach(function(key){
		handlers[key].init(app,io,db);
	})
	callback();
}

// Final output for startup
var finalizeInit = function(){
	console.log("------------------------");
}




exports.start = start;
