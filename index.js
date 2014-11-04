var colors = require('colors');

var server = require("./server");
var router = require("./router");
var db = require('./database');

server.start(router.route, db);
