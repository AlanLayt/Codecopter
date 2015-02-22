var url = require("url");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require('fs');


function route(app, db, handlers) {

		app.get('/new', function(req, res){
			handlers.ide.newSnippet(function(id){
				res.redirect('/c/' + id);
			});
		});
		app.get('/delete/:snid', function(req, res){
			var snid = req.params["snid"];

			handlers.ide.deleteSnippet(snid,function(id){
				res.redirect('/');
			});
		});


	app.get('/c/:snid', function(req, res){
		var snid = req.params["snid"];

		handlers.ide.getSnippet(snid,function(snippet){

			res.render('ide', { loc : req.headers.host, snid : snid, snippet : snippet, pretty : true });
		});
	});
	app.get('/stopTimeouts.js', function(req, res){
    	res.sendFile(__dirname + '/js/stopTimeouts.js');
	});
	app.get('/ide/core.js', function(req, res){
    	res.sendFile(__dirname + '/js/IDE.js');
	});
	app.get('/ide/style.css', function(req, res){
			res.sendFile(__dirname + '/css/IDE.css');
	});
	app.get('/icons.svg', function(req, res){
			res.sendFile(__dirname + '/css/svg-defs.svg');
	});
	app.post('/c/', urlencodedParser, function(req, res) {
		var title = req.body.title;
		console.log('request %s recieved.', title);
		res.redirect('/c/' + title);
	});



	app.get('/ace/*', function(req, res){
    	res.sendFile( __dirname + '/js/lib/ace/' + req.params[0]);
	});
	app.get('/lib/*', function(req, res){
    	res.sendFile( __dirname + '/js/lib/' + req.params[0]);
	});


	app.get('/s/:snid', function(req, res){
		var snid = req.params["snid"];

		handlers.ide.getSnippet(snid,function(snippet){
    //  fs.readFile(__dirname + '/js/stopTimeouts.js', 'utf8', function(err, text){
    //      res.send(text);
    //  });
			res.send('<script src=\'../stopTimeouts.js\'></script>' + snippet);
			//res.send(;
		});
	});



	app.get('/favicon.ico', function(req, res){
		res.sendFile(__dirname + '/img/icon.png');
	});




	app.get('/:var(r)?', function(req, res){
		var authDetails = handlers.auth.get(req, res);
		db.snippets.listAll(function(snippets){
	  		res.render('gallery', {
					loc: req.headers.host,
					items : snippets,
					pretty : true,
					userCount : handlers.ide.userCount(),
					logged : authDetails.logged,
					username : authDetails.logged?authDetails.username:'',
					userImage : authDetails.logged?authDetails.twitterAuth.profile_image_url:''
				});
		});
	});
	app.get('/gallery/style.css', function(req, res){
    	res.sendFile(__dirname + '/css/gallery.css');
	});

	app.get('/img/:img', function(req, res){
    	res.sendFile(__dirname + '/img/' + req.param("img"));
	});



	app.get('/auth', function(req, res){
		handlers.auth.login(req, res);
	});
	app.get('/auth/callback', function(req, res){
		handlers.auth.callback(req, res);
	});
	app.get('/auth/logout', function(req, res){
		handlers.auth.logout(req, res);
	});

	app.get('/CLEAR', function(req, res){
    db.clearCol('code');
		res.send("Clearing Collection");
		console.log("CLEARING DATABASE.");
	});



	app.get('*', function(req, res){
	  res.status(404).send('404\'d, friend.');
	});

	console.log("ROUTER: Initialized.");
}


exports.route = route;
