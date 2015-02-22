var db = null;
var collectionName = "code";

module.exports = {
	init : function(database){
		db = database;
		col = db.collection(collectionName);
	},


	count : function(callback) {
	  col.count(function(err, count) {
	    //assert.equal(err, count);
	    callback(count);
	  });
	},


	listAll : function(callback) {
	  col.find().sort({updated: -1}).toArray(function(err, snippet) {
	  //  assert.equal(err, null);
	    callback(snippet);
	  });
	},


	get : function(title, callback) {
	  col.find({ "title" : title }).toArray(function(err, snippet) {
	    //assert.equal(err, null);
	    callback(snippet);
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'title' : id }, function(err, result) {
	    console.log("Snippet removed: %s", id);
	    callback(id);
	  });
	},


	add : function(title, content, callback) {
		  col.insert([{
		    "title" : title,
		    "content" : content,
		    "posted" : new Date(),
		    "updated" : new Date()
		  }
		  ], function(err, result) {
		  //  assert.equal(err, null);
		  //  assert.equal(1, result.result.n);
		  //  assert.equal(1, result.ops.length);
		    callback(title);
		  });
	},


	update : function(title, content, callback) {
	  var title = title;

	  console.log(new Date());
		col.update(
	    { "title" : title },
	    {
	      $set: {
	        "content" : content,
	        "updated" : new Date()
	      }
	    },
	    {},
			function(err){
	  		callback(err,content,title);
	  	}
	  );
	},




	purge : function(){
		db.collection(col,function(err, collection){
	      collection.remove({},function(err, removed){
	      });
	  });
	}
}
