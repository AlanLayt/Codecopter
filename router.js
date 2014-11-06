var url = require("url");


function route(app) {
	app.get('/', function(req, res){
		res.render('IDE', {
			pretty: true,
			loc : req.headers.host
		});
	});

	app.get('/c/*', function(req, res){
		//	res.sendFile(__dirname + '/js/lib/ace/' + req.params[0]);
		console.log(req.params[0]);
		GLOBAL.loaded = req.params[0];
			res.render('IDE', {
				pretty: true,
				loc : req.headers.host
			});
	});

	app.get('/ide/style.css', function(req, res){
		res.sendFile(__dirname + '/css/IDE.css');
	});
	app.get('/ide/core.js', function(req, res){
		res.sendFile(__dirname + '/js/IDE.js');
	});
	app.get('/ace*', function(req, res){
			res.sendFile(__dirname + '/js/lib/ace/' + req.params[0]);
	});


	app.get('/demo.html', function(req, res){
		res.set('Content-Type', 'text/html');
		db.getSnippet("test", function(snippet){
			if(snippet.length>0){
			//	console.log("Preview initialized");
				res.send(new Buffer(snippet[0].content));
			}
			else {
				res.send(new Buffer('<p>404</p>'));
			}
		});
	});











	app.get('/favicon.ico', function(req, res){
		res.sendFile(__dirname + '/img/icon.png');
	});

	app.use(function(req, res, next){
		res.status(404);

		// respond with html page
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	});
}


exports.route = route;
