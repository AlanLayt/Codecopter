var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

GLOBAL.test = "LoadFailed.";

var start = function(route, db) {
	var database = db;
	route(app);

	console.log("------- Startup --------");

	db.connect(function(db){

		http.listen(80, function(){
			console.log('HTTP Server Started (Port 80)');

				database.getSnippet("test", function(snippet){
					if(snippet.length>0){
						console.log("Snippet '" + snippet[0].title + "' loaded.");
						GLOBAL.test = snippet[0].content;
					}
					else {
						database.addSnippet("test", "SNIPPETHERE", function(info,snippet){
							console.log("Snippet '" + snippet + "' added.");
						});
					}

					socketInit(database,function(){
						finalizeInit();
					});
				});

		});

		},
		function(err){
			console.log("Mongo database not found on port 27017. Exiting.");
			finalizeInit();
		});

}

var socketInit = function(db,callback){
	io.on('connection', function (socket) {
		console.log('User Connected. (' + socket.id + ')');

		socket.emit("connectionConfirmed",{content : GLOBAL.test});

		socket.on('remove', function (data) {
			socket.broadcast.emit("remove",data);
			GLOBAL.test = data.full;
		});

		socket.on('insert', function (data) {
			socket.broadcast.emit("insert",data);
			GLOBAL.test = data.full;

			db.updateSnippet("test", GLOBAL.test, function(info,snippet,content){
				console.log("Snippet updated.");
			});
		});
		socket.on('disconnect', function () {
			console.log('Connection lost. (' + socket.id + ')');
		});

	});


	callback();
}

var finalizeInit = function(){
	console.log("------------------------");
}




exports.start = start;
