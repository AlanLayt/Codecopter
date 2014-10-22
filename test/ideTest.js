var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')




var app = express()
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))











/*
function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;

	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World\r\r");
	response.end();
        
}

console.log("------- Startup --------");

db.connect(function(db){
		http.createServer(onRequest).listen(80);
		console.log("HTTP: Server Started.");
		dbt = db;

		console.log("------------------------");
	},
	function(err){
		console.log("Mongo database not found on port 27017. Exiting.");
		console.log("------------------------");
	});
*/