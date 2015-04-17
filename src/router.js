var url = require("url");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require('fs');
var pubDir = './public/';

function route(app, db, handlers) {

		// ========== Styling Routes ==========
		// CSS Rules
		app.get('/css/:styleSheet.css', function(req, res){
				var styleSheet = req.params["styleSheet"];
				res.sendFile('/css/' + styleSheet + '.css', {'root' : pubDir});
		});
		/*app.get('/ide/style.css', function(req, res){
				res.sendFile('/css/IDE.css', {'root' : pubDir});
		});
		app.get('/gallery/style.css', function(req, res){
				res.sendFile('/css/gallery.css', {'root' : pubDir});
		});*/
		// Images
		app.get('/img/:img', function(req, res){
				res.sendFile('/img/' + req.param("img"), {'root' : pubDir});
		});
		app.get('/icons.svg', function(req, res){
				res.sendFile('/img/svg-defs.svg', {'root' : pubDir});
		});
		app.get('/favicon.ico', function(req, res){
			res.sendFile('/img/icon.png', {'root' : pubDir});
		});


		// ========== Static Script Routes ==========
		app.get('/js/:jsfile.js', function(req, res){
				var jsfile = req.params["jsfile"];
			//	console.log('Load JS file: %s',jsfile);
				res.sendFile('/js/' + jsfile + '.js', {'root' : pubDir});
		});
		app.get('/stopTimeouts.js', function(req, res){
				res.sendFile('/js/stopTimeouts.js', {'root' : pubDir});
		});
		app.get('/ide/core.js', function(req, res){
				res.sendFile('/js/IDE.js', {'root' : pubDir});
		});
		app.get('/ace/*', function(req, res){
				res.sendFile( '/js/lib/ace/' + req.params[0], {'root' : pubDir});
		});
		app.get('/lib/*', function(req, res){
				res.sendFile( '/js/lib/' + req.params[0], {'root' : pubDir});
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
		app.get('/auth/key', function(req, res){
			handlers.auth.getKey(req, res);
		});



		// ========== Administration Routes ===========
		app.get('/admin/purge', function(req, res){
			db.snippets.purge();
			res.redirect('/');
		});




		// ========== Snippet Routes ==========

		app.get('/new', function(req, res){
			var user = handlers.auth.getUser(req, res).user;

			handlers.ide.add(false, user, req, function(err, id){
				return res.redirect('/c/' + id);
			});
		});
		app.get('/delete/:snid', function(req, res){
			var snid = req.params["snid"];

			handlers.ide.remove(snid,function(err, id){
				res.redirect('/');
			});
		});

		app.get('/c/:snid', function(req, res){
			var snid = req.params["snid"];


			// LOAD SNIPPET FROM IDE - HANDLE SNIPPET CACHING IN SNIPPETS HANDLER
			//db.snippets.get(snid,function(err, snippet){
			handlers.snippets.get(snid,function(err, snippet){
				//console.log(snippet.getUser());
				if(snippet)
					res.render('ide', {
						loc : req.headers.host,
						auth : handlers.auth.getUser(req,res),
						snippet : {
							snid : snid,
							title : snippet.getTitle(),
							desc : snippet.getDesc(),
							content : snippet.getContent(),
							poster : snippet.getAuthor()
						},
						pretty : true
					});
				else
					notFound(req,res,'Page not found');

			});
		});
		app.get('/s/:snid', function(req, res){
			var snid = req.params["snid"];
			handlers.snippets.get(snid,function(err, snippet){
				if(snippet)
					//res.send('<script src=\'../stopTimeouts.js\'></script>' + snippet.getContent());
					res.send(snippet.getContent());
				else
					notFound(req,res,'Page not found');
			});
		});
		app.get('/search/:search?', function(req, res){
			var search = req.params["search"];

			handlers.snippets.search(search,function(err, result){
				res.render('search', {
					loc : req.headers.host,
					auth : handlers.auth.getUser(req,res),
					search : {
						string : search,
						result : result
					},
					pretty : true
				});
			})
		});





	// Load entry page
	// :var(r)? removed?
	app.get('/', function(req, res){
		var authDetails = handlers.auth.get(req, res);
		handlers.snippets.listAll(function(err, snippets){
	  		res.render('gallery', {
					loc: req.headers.host,
					items : snippets,
					pretty : false,
					auth : handlers.auth.getUser(req,res),
				});
		});
	});



	app.get('/group/delete/:gid', function(req, res){
		var group = req.params["gid"];
		var authDetails = handlers.auth.get(req, res);

		db.groups.delete(group, function(err, groupid){
			console.log(groupid)
		});
	});
	app.post('/group/new', function(req, res) {
		var user = handlers.auth.getUser(req, res);
    var title = req.body.group.title;
    var desc = req.body.group.desc;

		console.log(title)
		handlers.groups.add({
			title : title,
			desc : desc,
			user : user.username
		});
	});

	app.get('/group/:gid/new', function(req, res){
		var gid = req.params["gid"];
		var user = handlers.auth.getUser(req, res).user;

		db.groups.get(gid,function(g){
			if(g!==false)
				handlers.ide.newSnippet(gid, user, req, function(id){
					res.redirect('/c/' + id);
				});
		});
	});

	app.get('/group/:gid', function(req, res){
		var gid = req.params["gid"];
		var authDetails = handlers.auth.get(req, res);

		handlers.groups.get(gid,function(g,snippets){
			console.log(g.title);
			res.render('group', {
				loc: req.headers.host,
				group : g,
				items : snippets,
				pretty : false,
				auth : handlers.auth.getUser(req,res),
			});
		});
	});
	app.get('/groups', function(req, res){
		var user = req.params["gid"];
		var authDetails = handlers.auth.get(req, res);

		handlers.groups.listAll(function(groups){
			res.render('groups', {
				loc: req.headers.host,
				groups : groups,
				pretty : false,
				auth : handlers.auth.getUser(req,res),
			});
		});
	});


	app.post('/snippet/update/', function(req, res){
		console.log(req.body);
		db.snippets.edit(req.body.snid,req.body.title,req.body.desc,function(err,details){
			console.log('Snippet %s updated.', details.title);
			res.json({ ok : true });
		});
	});



	// ================ User Routes ==================
	app.get('/:uname/:snid', function(req, res){
		var snid = req.params["snid"];
		var authDetails = handlers.auth.getUser(req, res);

		db.snippets.get(snid,function(err, snippet){
			if(authDetails.logged)
				console.log('%s viewing "%s"',authDetails.user.username,snippet.title);
			res.render('display', {
				loc : req.headers.host,
				auth : handlers.auth.getUser(req,res),
				snippet : {
					snid : snid,
					user : snippet.user,
					title : snippet.title,
					desc : snippet.desc,
				}
			});
		});
	});
	app.get('/:uname', function(req, res){
		var user = req.params["uname"];
		var authDetails = handlers.auth.get(req, res);

		db.snippets.listByUser(user, function(snippets){
			res.render('gallery', {
				loc: req.headers.host,
				auth : handlers.auth.getUser(req,res),
				items : snippets,
				pretty : false,
				userCount : handlers.ide.userCount()
			});
		});
	});


	app.get('*', function(req, res){
		notFound('Page not found');
	});


	var notFound = function(req,res,s){
	  res.status(404).send('404\'d, friend.' + s);
	}
	console.log("ROUTER: Initialized.");
}


exports.route = route;
