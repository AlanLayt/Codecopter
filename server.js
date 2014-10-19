var http = require("http");
var url = require("url");
var dbt = null;

function start(route, db, handle) {
	var db = db;
	//console.log(route)
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		//console.log("Request for " + pathname + " received.");
		//console.log(dbt);
		//request.db = dbt;
		route(db, handle, pathname, response);
		//console.log(route);
	}

	console.log("------- Startup --------");

	db.connect(function(db){
		http.createServer(onRequest).listen(80);
		console.log("HTTP: Server Started.");

	//	console.log(dbt);
		dbt = db;
	//	console.log(dbt);

		console.log("------------------------");
	});






}

exports.start = start;