var colors = require('colors');

var server = require("./server");
var router = require("./router");
var db = require('./database');
var requestHandlers = require("./requestHandlers");




var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/favicon.ico"] = requestHandlers.favico;







server.start(router.route, db, handle);
