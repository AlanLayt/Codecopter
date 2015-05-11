var db = null;
var collectionName = "groups";
var col, hashid;

var format = function(group){
	if(group==null) return group;
	return {
			id : group.gid,
			title : group.title,
			desc : group.description,
			user : group.user
		}
};
var formatGroups = function(groups){
	var s = [];
	groups.forEach(function(group){
		s.push(format(group));
	});
	return s;
}

module.exports = {
	init : function(database,hashid){
		hashid = hashid;
		db = database;
		col = db.collection(collectionName);
	},


	count : function(callback) {
	  col.count(function(err, count) {
	    return callback(err, count);
	  });
	},


	listAll : function(callback) {
		col.find().sort({updated: -1}).toArray(function(err, groups) {
			return callback(err, formatGroups(groups));
		});
	},


	get : function(id, callback) {
	  col.findOne({ "gid" : id },function(err, g) {
			//console.log(format(g))
			//	var group = g.length>0 ? g[0] : false;
	    	return callback(err, format(g));
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'gid' : id }, function(err, result) {
	    console.log("Group removed: %s", id);
	    return callback(err, id);
	  });
	},


	add : function(id, title, description, user, callback) {
		  col.insert([{
		    'gid' : id,
				'title' : title,
				'description' : description,
				'user' : user,
		    'created' : new Date()
		  }], function(err, result) {
				console.log(user)
		    return callback(err, id);
		  });
	},





	purge : function(){
    col.remove({},function(err, removed){
    });
	}
}
