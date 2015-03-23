var db = null;
var collectionName = "groups";
var col, hashid;

var format = function(groups){
	var s = [];
	groups.forEach(function(group){
		s.push({
			id : group.gid,
			title : group.title,
			desc : group.description
		});
	});
	return s;
};

module.exports = {
	init : function(database,hashid){
		hashid = hashid;
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
		col.find().sort({updated: -1}).toArray(function(err, groups) {
			//console.log(format(groups))
			callback(format(groups));
		});
	},


	get : function(id, callback) {
	  col.find({ "gid" : id }).toArray(function(err, group) {
	    	callback(group.length>0 ? group[0] : false);
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'gid' : id }, function(err, result) {
	    console.log("Group removed: %s", id);
	    callback(id);
	  });
	},


	add : function(id, title, description, user, callback) {
		  col.insert([{
		    'gid' : id,
				'title' : title,
				'description' : description,
				'user' : user,
		    'created' : new Date()
		  }
		  ], function(err, result) {
		    callback(id);
		  });
	},





	purge : function(){
    col.remove({},function(err, removed){
    });
	}
}
