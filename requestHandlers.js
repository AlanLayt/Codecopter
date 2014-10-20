var fs = require("fs");

function start(db,response) {
//	console.log("Initializing Test page.");

	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World\r\r");
        
    db.returnRecords(function(docs){
    	docs.forEach(function(t){
    		//console.log(t);
			response.write(t.a + "\r");
    	});

		response.end();
    });

}


function favico(db,response) {
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
exports.favico = favico;







