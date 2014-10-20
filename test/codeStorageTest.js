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
			db.addSnippet("test", "\
\
\
				var addSnippet = function(title, content, callback) {\
  var collection = mdb.collection('code');\
\
 // console.log(username)\
\
  collection.insert([\
    {\"title\" : title, \"content\" : content}\
  ], function(err, result) {\
    assert.equal(err, null);\
    assert.equal(1, result.result.n);\
    assert.equal(1, result.ops.length);\
    console.log(\"Snippet added.\");\
    callback(result, title);\
  });\
}", function(info,user){
				console.log("snippet " + user + " added.");
			});
		} 
	});
});