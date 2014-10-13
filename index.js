var colors = require('colors');
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");



var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/favicon.ico"] = requestHandlers.favico;


//console.log(handle);
server.start(router.route, handle);
