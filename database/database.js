var http = require("http");
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var snippets = require('./snippets');
var groups = require('./groups');
var mongoConnect = require('./connect');
var db=null;


// Initializes connection to database or runs failure callback
function connect(connection, connected, failed) {
	mongoConnect(connection,
		function(database,connection){
			db = database;
			snippets.init(db);
			groups.init(db);
			connected(database,connection);
		},failed)
}


function returnRecords(recordsFound) {
    return findDocuments(db, function(docs) {
        recordsFound(docs);
      return docs;
    });
}


var addUser = function(username, password, callback) {
  var collection = db.collection('users');

  collection.insert([
    {"username" : username, "password" : password}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log('DATABASE: User ' + username + ' added.');
    callback(result, username);
  });
}


var getUser = function(username, callback) {
  var collection = db.collection('users');
  collection.find({ "username" : username }).toArray(function(err, user) {
    assert.equal(err, null);
    callback(user);
  });
}





exports.getUser = getUser;
exports.addUser = addUser;

exports.returnRecords = returnRecords;
exports.connect = connect;



exports.snippets = snippets;
exports.groups = groups;
