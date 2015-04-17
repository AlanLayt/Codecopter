var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');
var session = require('express-session');
var compress = require('compression');
var bodyparse = require('body-parser');
var MongoStore = require('connect-mongo')(session);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(compress());
app.use(bodyparse.json());
app.use(bodyparse.urlencoded({ extended : false }));
//app.use(cookieParser())



// Start http server,MongoDB, sockets and initialize routing or fail gracefully
var start = function(config, route, db, handlers, callback) {
	app.config = config;

	db.connect(config, function(err,dbm,srv){
		console.log('MONGO: Database found. (Port %d)', srv.db.port);
		http.listen(srv.http.port, function(err){

			app.use(session({
				resave : true,
				saveUninitialized : true,
				secret : 'test',
				store : new MongoStore({ db : dbm })
			}));

			console.log('HTTP: Server Started. (Port %d)', srv.http.port);

			Object.keys(handlers).forEach(function(key){
				handlers[key].init({
					app : app,
					io : io,
					db : db,
					session : session,
					handlers : handlers
				});
			});

			route(app, db, handlers);

			return callback(err);
		});
	},
	function(err,srv){
		console.error('ERR: Mongo database not found on %s:%d. Exiting.',srv.db.host, srv.db.port);
		console.error(err);
		console.error('-----------------------');
		return err;
	});

}


exports.start = start;
