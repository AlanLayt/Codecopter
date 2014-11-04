var jade = require('jade');
var db = require('../../database');
var url = require("url");
var fs = require("fs");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

GLOBAL.test = "Failed to load.";

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
	res.render('ideTest', {
		pretty: true
	});
});

app.get('/ace*', function(req, res){
//	console.log("test");
//	console.log(req.params[0]);
		res.sendFile(__dirname + '/ace/' + req.params[0]);
	/*res.render('ideTest', {
		pretty: true
	});*/
});

app.get('/ideTest.css', function(req, res){
  res.sendFile(__dirname + '/ideTest.css');
});
app.get('/ideTestClient.js', function(req, res){
	res.sendFile(__dirname + '/ideTestClient.js');
});
app.get('/demo.html', function(req, res){

	res.set('Content-Type', 'text/html');
	db.getSnippet("test", function(snippet){
		if(snippet.length>0){
		//	console.log("Preview initialized");
			res.send(new Buffer(snippet[0].content));
		}
		else {
			res.send(new Buffer('<p>404</p>'));
		}
	});
});


http.listen(80, function(){
  console.log('listening on *:80');
});



db.connect(function(){
	console.log("Connected.");

	//db.clearCol('code');

	db.getSnippet("test", function(snippet){
		if(snippet.length>0){
			console.log("snippet " + snippet[0].title + " loaded.");
			GLOBAL.test = snippet[0].content;
		}
		else {
			db.addSnippet("test", "SNIPPETHERE", function(info,user){
				console.log("snippet " + user + " added.");
			});
		}

		init();
	});


});





// ========== Socket.io =========== \\

var init = function(){
	io.on('connection', function (socket) {
	  console.log('User Connected.');

		socket.emit("connectionConfirmed");
//		io.sockets.socket(socket.id).emit("init");

	 	socket.emit("contentUpdate",{ inf : GLOBAL.test });
	  socket.on('contentModified', function (data) {
			GLOBAL.test = data.inf;
	//		console.log(GLOBAL.test)
		//	console.log(socket);
	  	socket.broadcast.emit("contentUpdate",{ inf : GLOBAL.test });


			db.updateSnippet("test", GLOBAL.test, function(info,snippet,content){
				console.log("snippet updated.");
			});
	  });
	});



  io.on('disconnect', function () {
	});
}
