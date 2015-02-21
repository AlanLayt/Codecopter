var MongoClient = require('mongodb').MongoClient;

// Initializes connection to database or runs failure callback
module.exports = function(connection, connected, failed) {
	var mongourl = 'mongodb://'+connection.address+':'+connection.dbPort+'/'+connection.database;

	MongoClient.connect(mongourl, function(err, mdb) {
    if(err!= null && err.name=="MongoError")
      failed(err,connection);
    else {
      // Sets module mdb to database object
      db = mdb;
      connected(db,connection);
      return true;
    }

	});

  return false;
}
