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
			userinfo : snip.userinfo,
			gid : snip.gid
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
		});
	},


	listByUser : function(user, callback) {
		var s = [];
		col.find({"userinfo.screen_name" : user}).sort({updated: -1}).toArray(function(err, snippets) {
			callback(formatSnippet(snippets));
		});
	},


		listByGroup : function(gid, callback) {
			var s = [];
			col.find({gid : gid}).sort({updated: -1}).toArray(function(err, snippets) {
				//console.log(formatSnippet(snippets))
				callback(formatSnippet(snippets));
			});
		},

		listByGroups : function(ids, callback) {
			var s = [];
			col.find({gid : {$in : ids}}).sort({updated: -1}).toArray(function(err, snippets) {
				//console.log(formatSnippet(snippets))
				callback(formatSnippet(snippets));
			});
		},


	get : function(id, callback) {
	  col.find({ "snid" : id }).toArray(function(err, snippet) {
			//if()
	    	callback(snippet.length>0 ? formatSnippet(snippet)[0] : false);
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'snid' : id }, function(err, result) {
	    console.log("Snippet removed: %s", id);
	    callback(id);
	  });
	},


	add : function(id, content, user, group, callback) {
		  col.insert([{
		    "snid" : id,
				'title' : '',
				'description' : '',
				'userinfo' : user,
		    "content" : content,
		    "posted" : new Date(),
		    "updated" : new Date(),
				'gid' : group
		  }
		  ], function(err, result) {
		    callback(id);
		  });
	},


	edit : function(id, title, desc, callback) {
	  var id = id;

		col.update(
	    { 'snid' : id },
	    {
	      $set: {
	        'title' : title,
	        'description' : desc
	      }
	    },
	    {},
			function(err){
	  		callback(err,{title:title,desc:desc},id);
	  	}
	  );
	},

	update : function(id, content, callback) {
	  var id = id;

		col.update(
	    { 'snid' : id },
	    {
	      $set: {
	        'content' : content,
	        'updated' : new Date()
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
