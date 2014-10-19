var http = require("http");
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mdb=null;




function connect(connected) {
	var mongourl = 'mongodb://localhost:27017/codeucation';
	var connected = connected;
	var mdbt;

	MongoClient.connect(mongourl, function(err, db) {
		//mdb = db;
		assert.equal(null, err);
		console.log("MONGODB: Connection Successful.");
		connected(db); 


	//	console.log(mdb);
		mdb = db;
	//	console.log(mdb);
	});
	//	console.log(test);

//	MongoClient.open(function(foo,bar){
//		console.log(bar)
//	});
	mdb = mdbt;

//	console.log(mdb)
	//connected(MongoClient);

	return MongoClient;

}


function returnRecords(recordsFound) {

	//console.log(mdb);
   // insertDocuments(mdb, function(docs) {
		return findDocuments(mdb, function(docs) {
   			recordsFound(docs);
			return docs;
		});
    //});

}

exports.returnRecords = returnRecords;
exports.connect = connect;






var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    //assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs)
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
