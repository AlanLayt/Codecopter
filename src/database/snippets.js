var db = null;
var collectionName = "code";
var col;


var formatSnippet = function(snip){
	return {
		id : snip.snid,
		title : snip.title==null?'':snip.title,
		desc : snip.description==null?'':snip.description,
		content : snip.content,
		user : snip.userinfo,
		gid : snip.gid
	};
};

var formatSnippets = function(snippets){
	var s = [];
	snippets.forEach(function(snip){
		s.push(formatSnippet(snip));
	});
	return s;
};


module.exports = {
	init : function(database){
		db = database;
		col = db.collection(collectionName);
		return col;
	},


	count : function(callback) {
	  col.count(function(err, count) {
	    return callback(err, count);
	  });
	},


	listAll : function(callback) {
		col.find().sort({updated: -1}).toArray(function(err, snippets) {
			return callback(err, formatSnippets(snippets));
		});
	},


	listByUser : function(user, callback) {
		col.find({"userinfo.username" : user}).sort({updated: -1}).toArray(function(err, snippets) {
			return callback(err, formatSnippet(snippets));
		});
	},


	listByGroup : function(gid, callback) {
		col.find({gid : gid}).sort({updated: -1}).toArray(function(err, snippets) {
			return callback(err, formatSnippet(snippets));
		});
	},

	listByGroups : function(ids, callback) {
		col.find({gid : {$in : ids}}).sort({updated: -1}).toArray(function(err, snippets) {
			return callback(err, formatSnippet(snippets));
		});
	},


	get : function(id, callback) {
		col.findOne({ "snid" : id },function(err,s){
			return callback(err, formatSnippet(s));
		});
	},


	delete : function(id, callback) {
	  col.remove({ 'snid' : id }, function(err, result) {
	    console.log("Snippet removed: %s", id);
	    return callback(err, id);
	  });
	},


	search : function(search, callback) {
	  col.find({ "content" : new RegExp(search) }).toArray(function(err, snippet) {
			var s = snippet.length>0 ? formatSnippet(snippet) : false;
	    return callback(err, s);
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
		  }], function(err, result) {
		    return callback(err, id);
		  });
	},


	edit : function(id, title, desc, callback) {
	  //var id = id;

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
	  		return callback(err,{title:title,desc:desc},id);
	  	}
	  );
	},

	update : function(id, content, callback) {
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
	  		return callback(err,id);
	  	}
	  );
	},




	purge : function(){
    col.remove({},function(err, removed){
    });
	}
}
