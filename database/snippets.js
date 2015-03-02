var db = null;
var collectionName = "code";
var col;


var formatSnippet = function(snippets){
	var s = [];
	snippets.forEach(function(snip){
		s.push({
			id : snip.snid,
			title : snip.title,
			desc : snip.description,
			content : snip.content,
			userinfo : snip.userinfo
		});
	});
	return s;
};


module.exports = {
	init : function(database){
		db = database;
		col = db.collection(collectionName);
	},


	count : function(callback) {
	  col.count(function(err, count) {
	    callback(count);
	  });
	},


	listAll : function(callback) {
		var s = [];
		col.find().sort({updated: -1}).toArray(function(err, snippets) {
			callback(formatSnippet(snippets));
			/*	snippets.forEach(function(snippest){
				s.push({
					id : snip.snid,
					title : snip.title,
					desc : snip.description
				});
			})
			callback(s);*/
		});
	},


	listByUser : function(user, callback) {
		var s = [];
		col.find({"userinfo.screen_name" : user}).sort({updated: -1}).toArray(function(err, snippets) {
			callback(formatSnippet(snippets));
		});
	},


	get : function(id, callback) {
	  col.find({ "snid" : id }).toArray(function(err, snippet) {
	    callback(formatSnippet(snippet)[0]);
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'snid' : id }, function(err, result) {
	    console.log("Snippet removed: %s", id);
	    callback(id);
	  });
	},


	add : function(id, content, user, callback) {
		  col.insert([{
		    "snid" : id,
				'title' : '',
				'description' : '',
				'userinfo' : user,
		    "content" : content,
		    "posted" : new Date(),
		    "updated" : new Date()
		  }
		  ], function(err, result) {
		    callback(id);
		  });
	},


	update : function(id, content, details, callback) {
	  var id = id;

	  console.log(details.title);
		col.update(
	    { 'snid' : id },
	    {
	      $set: {
	        'content' : content,
	        'updated' : new Date(),
					'title' : details.title,
					'description' : details.desc
	      }
	    },
	    {},
			function(err){
	  		callback(err,content,id);
	  	}
	  );
	},




	purge : function(){
    col.remove({},function(err, removed){
    });
	}
}
