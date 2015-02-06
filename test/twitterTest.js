var db = require("../database.js");
var userToAdd = "test";
var app = require('express')();
var OAuth= require('oauth').OAuth;
var session = require('cookie-session');


console.log("================== Twitter oAuth Test ==================");
//console.log("Connected.");

app.use(session({
	keys : ['test']
}));

function consumer(){
		return new OAuth(
			"https://api.twitter.com/oauth/request_token",
			"https://api.twitter.com/oauth/access_token",
			"mw6PxiPT3pwUVS4X79DipfUVs",
			"JZE3yiF0Ibg6LpWV7UBARKBb8ZRGhIVoTh74HMgLs9yjzzZr8V",
			"1.0A",
			"http://127.0.0.1:88/sessions/callback",
			"HMAC-SHA1"
		);
}


app.get('/', function(req, res){
	//console.log(req
	if(req.session.twitterScreenName){
		console.log(req.session.twitterScreenName);
		var uname = req.session.twitterScreenName;
		req.session.twitterScreenName = undefined;
		res.send('You are signed in: ' + uname);
	}
	else
	  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
	    if (error) {
	      res.send("Error getting OAuth request token : " + console.log(error), 500);
	    } else {
	      req.session.oauthRequestToken = oauthToken;
	      req.session.oauthRequestTokenSecret = oauthTokenSecret;
	      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
	    }
	  });
});


app.get('/sessions/callback', function(req, res){
	console.log("------------- User Auth Details -------------");
	console.log("Request Token:        "+req.session.oauthRequestToken);
	console.log("Request Token Secret: "+req.session.oauthRequestTokenSecret);
	console.log("oAuth Verifier:       "+req.query.oauth_verifier);
	console.log("---------------------------------------------");
	consumer().getOAuthAccessToken(
			req.session.oauthRequestToken,
			req.session.oauthRequestTokenSecret,
			req.query.oauth_verifier,
			function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
				if (error) {
					res.send("Error getting OAuth access token : " + console.log(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
				} else {
					req.session.oauthAccessToken = oauthAccessToken;
					req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
					// Right here is where we would write out some nice user stuff
					consumer().get("https://api.twitter.com/1.1/account/verify_credentials.json",
						req.session.oauthAccessToken,
						req.session.oauthAccessTokenSecret,
						function (error, data, response) {
							if (error) {
								res.send("Error getting twitter screen name : " + console.log(error), 500);
							} else {
								req.session.twitterScreenName = JSON.parse(data).screen_name;
								res.statusCode = 302;
								res.setHeader("Location", "/");
								res.end();
								//console.log(JSON.parse(data).screen_name);
								res.send('You are signed in: ' + req.session.twitterScreenName);
								//console.log(data);
							}
						});
			}
	});
});

console.log("Listening.");
app.listen(88);
