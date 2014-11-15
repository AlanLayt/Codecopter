var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

GLOBAL.test = "LoadFailed.";

var start = function(route, db, handle) {
	var database = db;
	//route(app);
		route(db, handle, response);

	console.log("------- Startup --------");

	db.connect(function(db){

		http.listen(80, function(){
			console.log('HTTP Server Started (Port 80)');

			socketInit(database,function(){
				finalizeInit();
			});
		});

		},
		function(err){
			console.log("Mongo database not found on port 27017. Exiting.");
			finalizeInit();
		});

}

var socketInit = function(db,callback){
	callback();
}

var finalizeInit = function(){
	console.log("------------------------");
}




exports.start = start;
