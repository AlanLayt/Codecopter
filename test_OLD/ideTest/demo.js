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

app.get('/ideTest.css', function(req, res){
  res.sendFile(__dirname + '/ideTest.css');
});
app.get('/ideTestClient.js', function(req, res){
  res.sendFile(__dirname + '/ideTestClient.js');
});


http.listen(80, function(){
  console.log('listening on *:80');
});



db.connect(function(){
	console.log("Connected."); 

	//db.clearCol('code');

	db.getSnippet("test", function(snippet){
		//console.log(user)
		if(snippet.length>0){
			console.log("snippet " + snippet[0].title + " loaded.");
			console.log(snippet[0])
			//console.log(user.username);
			GLOBAL.test = snippet[0].content;


			init();
		}
		else {
			db.addSnippet("test", "SNIPPETHERE", function(info,user){
				console.log("snippet " + user + " added.");
			});

			init();
		}
	});


});





// ========== Socket.io =========== \\

var init = function(){
	io.on('connection', function (socket) {
	  console.log('User Connected.');

		socket.emit("init");

	 	socket.emit("contentUpdate",{ inf : GLOBAL.test });
	  socket.on('contentModified', function (data) {
			GLOBAL.test = data.inf;
	//		console.log(GLOBAL.test)
	  	socket.broadcast.emit("contentUpdate",{ inf : GLOBAL.test });


			db.updateSnippet("test", GLOBAL.test, function(info,snippet,content){
				console.log("snippet updated.");
			});
	  });
	});
}
