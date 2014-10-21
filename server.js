var http = require("http");
var url = require("url");
var dbt = null;

function start(route, db, handle) {


	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;

		route(db, handle, pathname, response);
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


}





exports.start = start;