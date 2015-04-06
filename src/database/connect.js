var MongoClient = require('mongodb').MongoClient;

// Initializes connection to database or runs failure callback
module.exports = function(connection, connected, failed) {
	var mongourl = 'mongodb://'+connection.db.host+':'+connection.db.port+'/'+connection.db.database;

	MongoClient.connect(mongourl, function(err, mdb) {
    if(err!= null && err.name=="MongoError")
      return failed(err,connection);
    else {
      // Sets module mdb to database object
      db = mdb;
      return connected(err,db,connection);
    }

	});
}
