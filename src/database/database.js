var http = require("http");
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Hashids = require('hashids');
var hashid = new Hashids("Twoflower");

var snippets = require('./snippets');
var groups = require('./groups');
var mongoConnect = require('./connect');
var db=null;


module.exports = {
	connect : function(connection, connected, failed) {
		return mongoConnect(connection,
						function(err,database,connection){
							db = database;
							snippets.init(db, hashid);
							groups.init(db, hashid);

							return connected(err, database, connection);
						},failed)
	},

	snippets : snippets,
	groups : groups
}
