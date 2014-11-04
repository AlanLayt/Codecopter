var db = require("../database.js");





db.connect(function(){
	console.log("Connected.");

	//db.clearCol('code');

	db.getSnippet("test", function(user){
		//console.log(user)
		if(user.length>0){
			console.log("snippet " + user[0].username + " already exists.");
			console.log(user[0].content)
			//console.log(user.username);
		}
		else {
			db.addSnippet("test", "SNIPPETHERE", function(info,user){
				console.log("snippet " + user + " added.");
			});
		}
	});
});
