var url = require("url");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require('fs');


function route(app, db, handlers) {

		// ========== Styling Routes ==========
		// CSS Rules
		app.get('/css/:styleSheet.css', function(req, res){
				var styleSheet = req.params["styleSheet"];
				res.sendFile(__dirname + '/css/' + styleSheet + '.css');
		});
		app.get('/ide/style.css', function(req, res){
				res.sendFile(__dirname + '/css/IDE.css');
		});
		app.get('/gallery/style.css', function(req, res){
				res.sendFile(__dirname + '/css/gallery.css');
		});
		// Images
		app.get('/img/:img', function(req, res){
				res.sendFile(__dirname + '/img/' + req.param("img"));
		});
		app.get('/icons.svg', function(req, res){
				res.sendFile(__dirname + '/css/svg-defs.svg');
		});
		app.get('/favicon.ico', function(req, res){
			res.sendFile(__dirname + '/img/icon.png');
		});


		// ========== Static Script Routes ==========
		app.get('/stopTimeouts.js', function(req, res){
				res.sendFile(__dirname + '/js/stopTimeouts.js');
		});
		app.get('/ide/core.js', function(req, res){
				res.sendFile(__dirname + '/js/IDE.js');
		});
		app.get('/ace/*', function(req, res){
				res.sendFile( __dirname + '/js/lib/ace/' + req.params[0]);
		});
		app.get('/lib/*', function(req, res){
				res.sendFile( __dirname + '/js/lib/' + req.params[0]);
		});

		// ========== Authentication Routes ==========
		app.get('/auth', function(req, res){
			handlers.auth.login(req, res);
		});
		app.get('/auth/callback', function(req, res){
			handlers.auth.callback(req, res);
		});
		app.get('/auth/logout', function(req, res){
			handlers.auth.logout(req, res);
		});



		// ========== Administration Routes ===========
		app.get('/admin/purge', function(req, res){
			db.snippets.purge();
			res.redirect('/');
		});




		// ========== Snippet Routes ==========

		app.get('/new', function(req, res){
			handlers.ide.newSnippet(req,function(id){
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

			db.snippets.get(snid,function(snippet){
				res.render('ide', {
					loc : req.headers.host,
					snid : snid,
					title : snippet.title,
					desc : snippet.desc,
					snippet : snippet.content,
					user : handlers.auth.getUser(req,res),
					pretty : false,
				});

			});
		});
		app.get('/s/:snid', function(req, res){
			var snid = req.params["snid"];
			handlers.ide.getSnippet(snid,function(snippet){
				res.send('<script src=\'../stopTimeouts.js\'></script>' + snippet);
			});
		});





	// Load entry page
	// :var(r)? removed?
	app.get('/', function(req, res){
		var authDetails = handlers.auth.get(req, res);
		db.snippets.listAll(function(snippets){
	  		res.render('gallery', {
					loc: req.headers.host,
					items : snippets,
					pretty : false,
					userCount : handlers.ide.userCount(),
					user : handlers.auth.getUser(req,res)
				});
		});
	});






app.get('/group/:gid', function(req, res){
	var user = req.params["gid"];
	var authDetails = handlers.auth.get(req, res);

	db.groups.listAll(function(groups){
		groups.forEach(function(g){
			console.log(g.title);
		})
	});
});
app.get('/group/new', function(req, res){
	var user = req.params["gid"];
	var authDetails = handlers.auth.get(req, res);

	db.groups.add('test', 'test', 'test', 'test', function(groups){
		console.log(groups)
	});
});

app.get('/groups', function(req, res){
	var user = req.params["gid"];
	var authDetails = handlers.auth.get(req, res);

	db.groups.listAll(function(groups){
		res.render('groups', {
			loc: req.headers.host,
			items : groups,
			pretty : false,	
			user : handlers.auth.getUser(req,res)
		});
	});
});


	app.get('/:uname/:snid', function(req, res){
		var snid = req.params["snid"];
		var authDetails = handlers.auth.get(req, res);

		db.snippets.get(snid,function(snippet){
			res.render('display', {
				loc : req.headers.host,
				snid : snid,
				snippet : snippet,
				user : handlers.auth.getUser(req,res),
				poster : snippet.userinfo
			});
		});
	});
	app.get('/:uname', function(req, res){
		var user = req.params["uname"];
		var authDetails = handlers.auth.get(req, res);

		db.snippets.listByUser(user, function(snippets){
			res.render('gallery', {
				loc: req.headers.host,
				items : snippets,
				pretty : false,
				userCount : handlers.ide.userCount(),
				user : handlers.auth.getUser(req,res)
			});
		});
	});


	app.get('*', function(req, res){
	  res.status(404).send('404\'d, friend.');
	});

	console.log("ROUTER: Initialized.");
}


exports.route = route;
