var db = require("../database.js");
var userToAdd = "test";




db.connect(function(){
	console.log("================== User Add Test ==================");
	console.log("Connected.");
	
	db.clearCol('users');

	db.getUser(userToAdd, function(user){
		if(user.length>0){
			console.log("User " + user[0].username + " already exists.");
		}
		else {
			db.addUser(userToAdd, "test", function(info,user){
				console.log("User " + user + " added.");
			});
		}
	});
});