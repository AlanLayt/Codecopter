var db = require("../database.js");
var userToAdd = "test";




db.connect(function(){
	console.log("Connected.");
	
	//db.clearCol('users');

	db.getUser(userToAdd, function(user){
		//console.log(user)
		if(user.length>0){
			console.log("User " + user[0].username + " already exists.");
			//console.log(user.username);
		}
		else {
			db.addUser(userToAdd, "test", function(info,user){
				console.log("User " + user + " added.");
			});
		}
	});
});