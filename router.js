function route(db, handle, pathname, response) {
	//console.log("About to route a request for " + pathname);
	//console.log(handle);
	if (typeof handle[pathname] === 'function') {
		handle[pathname](db,response);
	} else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();

	}
}


exports.route = route;