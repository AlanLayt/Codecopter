var http = require("http");
var url = require("url");
var dbt = null;






var colors = require('colors');
var db = require('../database');



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
