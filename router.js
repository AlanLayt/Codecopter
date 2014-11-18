var url = require("url");


function route(app, db, handlers) {
	//console.log(db);

//	console.log(handlers.ide);

	app.get('/', function(req, res){
	  res.render('ide', { loc: req.headers.host });
	});
	app.get('/c/:snid', function(req, res){
		var snid = req.param("snid");
		res.render('ide', { loc : req.headers.host, snid : snid });
	});
	app.get('/ide/core.js', function(req, res){
    	res.sendFile(__dirname + '/js/IDE.js'); 
	});
	app.get('/ide/style.css', function(req, res){
    	res.sendFile(__dirname + '/css/IDE.css'); 
	});


	app.get('/ace/*', function(req, res){
    	res.sendFile( __dirname + '/js/lib/ace/' + req.params[0]); 
	});

	console.log("ROUTER: Started.");
}


exports.route = route;
