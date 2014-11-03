var jade = require('jade');
var db = require('../database'); 
var url = require("url");
var fs = require("fs");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

GLOBAL.test = "";

app.set('view engine', 'jade');

app.get('/', function(req, res){
	res.render('ideTest', {  });
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







// ========== Socket.io =========== \\



io.on('connection', function (socket) {
  console.log('User Connected.');

 	socket.emit("contentUpdate",{ inf : GLOBAL.test });
  socket.on('contentModified', function (data) {
		GLOBAL.test = data.inf;
  	socket.broadcast.emit("contentUpdate",{ inf : GLOBAL.test });
  });
});