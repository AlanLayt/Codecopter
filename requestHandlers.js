var fs = require("fs");

function start(response) {
	console.log("Request handler 'start' was called.");

	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}
function upload(response) {
	console.log("Request handler 'upload' was called.");
}
function favico(response) {
	fs.readFile("./img/favicon.png", "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/png"});
			response.write(file, "binary");
			response.end();
		}
	});

}

exports.start = start;
exports.upload = upload;
exports.favico = favico;