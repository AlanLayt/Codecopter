var OAuth= require('oauth').OAuth;
var jwt = require('jsonwebtoken');

var app,io,db,session;
var url = require('url');
var loaded = Array();
var clientNum = 0;

var init = function(mapp,mio,mdb,sess){
	app = mapp,
	io = mio,
	db = mdb;
	start();
	console.log('AUTH: Initialized');
}

var start = function(){
}



function consumer(){
	return new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		app.config.auth.twitter.consumerKey,
		app.config.auth.twitter.applicationSecret,
		"1.0A",
		'http://' + app.config.http.host + ':' + app.config.http.port + '/auth/callback',
		"HMAC-SHA1"
	);
}

var logout = function(req, res){
	req.session.twitterScreenName = undefined;
	req.session.twitterAuth = undefined;
	res.statusCode = 302;
	res.setHeader("Location", "/");
	res.end();
}

var getUser = function(req, res){
	if(req.session.twitterAuth){
		var authDetails = req.session.twitterAuth;
		return {
			logged : true,
			user : {
				username : authDetails.screen_name,
				icon : authDetails.profile_image_url
			}
		};
	}
	else
		return {logged:false};

}

var getKey = function(req,res){
	var token = jwt.sign(getUser(req,res), 'secretkey', { expiresInMinutes: 60*5 });

	res.json({token: token});
}

var decodeKey = function(token){
	var decoded = jwt.verify(token, 'secretkey');
	return decoded;
}

var get = function(req, res){
	if(req.session.twitterScreenName){
		var uname = req.session.twitterScreenName;
		return {logged:true,username:uname,twitterAuth:req.session.twitterAuth};
	}
	else
		return {logged:false};

}

var login = function(req, res){
	if(req.session.twitterScreenName){
		var uname = req.session.twitterScreenName;


		return {logged:true,username:uname};
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
}

var callback = function(req, res){
	console.log(req);
	consumer().getOAuthAccessToken(
		req.session.oauthRequestToken,
		req.session.oauthRequestTokenSecret,
		req.query.oauth_verifier,
		function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if (error) {
				res.send("Error getting OAuth access token : " + console.log(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+results+"]", 500);
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
						req.session.twitterAuth = JSON.parse(data);
						req.session.save();

						//console.log(JSON.stringify(req.session));
						res.statusCode = 302;
						res.setHeader("Location", "/");
						res.end();
					}
				});
			}
		});

}



exports.init = init;
exports.start = start;
exports.login = login;
exports.getKey = getKey;
exports.decodeKey = decodeKey;

exports.get = get;
exports.getUser = getUser;
exports.logout = logout;
exports.callback = callback;
