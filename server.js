var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');




// Start http server,MongoDB, sockets and initialize routing or fail gracefully
var start = function(route, db, handlers) {
	console.log("------- Startup --------");

	db.connect(function(dbm,srv){
		console.log('MONGO: Database found. (Port %d)', srv.port);
		http.listen(88, function(){
			console.log('HTTP: Server Started. (Port 80)');

			handleInit(handlers,db,function(){
				route(app, db, handlers);
				finalizeInit();
			});
		});

		},
		function(err,srv){
			console.error('ERR: Mongo database not found on port %d. Exiting.', srv.port);
			finalizeInit();
		}
	);

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
