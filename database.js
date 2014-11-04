var http = require("http");
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mdb=null;




function connect(connected, failed) {
	var mongourl = 'mongodb://localhost:27017/codeucation';
	var connected = connected;
	var mdbt;

	MongoClient.connect(mongourl, function(err, db) {
    mdb = db;
    //console.log(err.name);
    if(err!= null && err.name=="MongoError")
      failed(err);
    else {

  		//console.log(assert.equal(null, err));
  		console.log("MONGODB: Connection Successful.");

  		connected(db);

      return true;
    }

	});

  return false;
//	return MongoClient;

}




function returnRecords(recordsFound) {
		return findDocuments(mdb, function(docs) {
   			recordsFound(docs);
			return docs;
		});
}


var addUser = function(username, password, callback) {
  var collection = mdb.collection('users');

 // console.log(username)

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
  var collection = mdb.collection('users');
  collection.find({ "username" : username }).toArray(function(err, user) {
    assert.equal(err, null);
    //assert.equal(1, docs.length);
    //console.log('DATABASE: user ' + user + ' returned.');
    callback(user);
  });
}








var addSnippet = function(title, content, callback) {
  var collection = mdb.collection('code');

 // console.log(username)

  collection.insert([
    {"title" : title, "content" : content}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("DATABASE: Snippet added.");
    callback(result, title);
  });
}


var getSnippet = function(title, callback) {
	var collection = mdb.collection('code');
	collection.find({ "title" : title }).toArray(function(err, snippet) {
		assert.equal(err, null);
		//assert.equal(1, docs.length);
	//	console.log(snippet)
		console.log("DATABASE: snippet returned.");
		callback(snippet);
	});
}

var updateSnippet = function(title, content, callback) {

	var collection = mdb.collection('code');
	collection.update({ "title" : title },{$set: {"content" : content }},{},
		function(err,snippet,content){
		console.log("DATABASE: snippet " + snippet + " updated.");
		callback(err,snippet);
	});

/*.toArray(function(err, user) {
		assert.equal(err, null);
		//assert.equal(1, docs.length);
	});*/
}

















var clearCol = function(col) {
  mdb.collection(col,function(err, collection){
      collection.remove({},function(err, removed){
      });
  });
}


exports.addSnippet = addSnippet;
exports.getSnippet = getSnippet;
exports.updateSnippet = updateSnippet;

exports.getUser = getUser;
exports.addUser = addUser;

exports.returnRecords = returnRecords;
exports.connect = connect;


exports.clearCol = clearCol;






var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    //assert.equal(2, docs.length);
    console.log("DATABASE: Records returned.");
  //  console.dir(docs)
    callback(docs);
  });
}


var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insert([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 document into the document collection");
    callback(result);
  });
}

















var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.update({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
}

var removeDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.remove({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
}
