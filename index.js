var colors = require('colors');

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var db = require('./database');



var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/favicon.ico"] = requestHandlers.favico;




server.start(router.route, db, handle);
