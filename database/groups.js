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
		//	console.log("list all")
			callback(format(groups));
		});
	},


	get : function(id, callback) {
	  col.find({ "gid" : id }).toArray(function(err, group) {
	    callback(group);
	  });
	},


	delete : function(id, callback) {
	  col.remove({ 'gid' : id }, function(err, result) {
	    console.log("Group removed: %s", id);
	    callback(id);
	  });
	},


	add : function(title, description, user, callback) {
			console.log('add');
			console.log(this);
			var id = hashid.encode(this.count());
		  col.insert([{
		    'gid' : id,
				'title' : title,
				'description' : description,
				'userinfo' : user,
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
