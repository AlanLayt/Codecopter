var fs = require("fs");

function start(db,res) {
	res.render('IDE', {
		pretty: true
	});
}


function favico(db,response) {
	fs.readFile("./img/icon.png", "binary", function(error, file) {
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
exports.favico = favico;
