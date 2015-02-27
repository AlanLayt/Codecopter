var app,io,db;
var url = require('url');
var Hashids = require('Hashids');
var loaded = Array();
var clientNum = 0;

var init = function(mapp,mio,mdb){
  app = mapp,
  io = mio,
  db = mdb;

  start();
  console.log('IDE: Initialized');
}

var start = function(){

  io.on('connection', function (socket) {

    console.log('User Connected. (%s)', socket.id);
    clientNum++;

    socket.on('disconnect', function () {
      console.log('Client Disconnected. (%s)', socket.id);
      clientNum--;
    });


    socket.emit("connectionConfirmed",{content : GLOBAL.test});

    // Handles request for whole snippet and sends resulting snippet
    socket.on('requestSnip', function (data) {
      if(data.snid in loaded){
        console.log('Snippet already loaded.');
      }
      else {
        db.snippets.get(data.snid,function(snippet){
          if(snippet.length<1){
            console.log('ERR: SNIPPET NOT FOUND');
          } else {
            loaded[data.snid] = snippet.content;
          }
        });
      }
      socket.join(data.snid);
    });

    // Handles remove request and brodcasts to other connected clients
    socket.on('remove', function (data) {
      socket.broadcast.to(data.snid).emit("remove",data);
      GLOBAL.test = data.full;
      loaded[data.snid] = data.full;
    });

    socket.on('save', function (data) {
    //  console.log(data)
      db.snippets.update(data.snid, loaded[data.snid], {title : data.title, desc : data.desc}, function(info,content,title){
        console.log('Snippet %s updated.', data.snid);
      });
    });
    socket.on('insert', function (data) {
      socket.broadcast.to(data.snid).emit("insert",data);
      GLOBAL.test = data.full;
      loaded[data.snid] = data.full;
     // console.log(data)

    //  db.updateSnippet(data.snid, loaded[data.snid], function(info,content,title){
    //    console.log('Snippet %s updated.', title);
    //  });
    });



    socket.on('cursorMove', function (data) {
      data.socketid = socket.id;
      socket.broadcast.to(data.snid).emit("cursorMove",data);
      //console.log('cursormove');
    });

  });

  console.log("SOCKET: IDE Sockets Initialized.");
  return this;
}

var userCount = function(){
  return clientNum;//io.clients().length;
}

var newSnippet = function(req,callback){
		db.snippets.count(function(count){
			var hashids = new Hashids("Twoflower"),
		  id = hashids.encode(count,Date.now());

      db.snippets.add(id,'',req.session.twitterAuth,function(id){
        console.log('IDE: New snippet, %s, added.', id);
        callback(id);
      });

		});
}

var deleteSnippet = function(id,callback){
    db.snippets.delete(id,function(id){
      console.log('IDE: Snippet, %s, deleted.', id);
      callback(id);
    });

}

var getSnippet = function(snid,callback){
  if(snid in loaded)
    callback(loaded[snid]);
  else
    db.snippets.get(snid,function(snippet){
      callback(snippet.content);
    });
}


exports.start = start;
exports.init = init;
exports.getSnippet = getSnippet;
exports.deleteSnippet = deleteSnippet;
exports.newSnippet = newSnippet;
exports.userCount = userCount;
