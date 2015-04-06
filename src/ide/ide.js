var app,io,db,auth,
    url = require('url'),
    Hashids = require('hashids'),
    Snippet = require('./snippet');

var loaded = Array(),
    connectionCount = 0;


var init = function(mapp,mio,mdb,session,mauth){
  app = mapp,
  io = mio,
  db = mdb;
  auth = mauth;

  start();
  console.log('IDE: Initialized');
}

var start = function(){

  io.on('connection', function (socket) {
    connectionCount++;
    socket.user = {username : false};

    socket.on('disconnect', function () {
      connectionCount--;
    });

    socket.on('authKey', function (data) {
      var details = auth.decodeKey(data.token);
      if(!details.logged){
      //  console.log("Client[%s] not logged in.", socket.id);
      }
      else{
          socket.user = details.user;
          console.log("Client[%s] has connected as user %s", socket.id, details.user.username)
          //console.log(details);
      }
    });

    console.log('USER JOIN');
    socket.emit("connectionConfirmed",{content : GLOBAL.test});

    // Handles request for whole snippet and sends resulting snippet
    socket.on('requestSnip', function (data) {
      if(data.snid in loaded){
        console.log('Snippet already loaded.');
      }
      else {
        db.snippets.get(data.snid,function(err, snippet){
          if(snippet.length<1){
            console.log('ERR: SNIPPET NOT FOUND');
          } else {
            loaded[data.snid] = new Snippet(snippet);
          }
        });
      }
      console.log(data.snid)
      socket.join(data.snid);
    });

    // Handles remove request and brodcasts to other connected clients
    socket.on('remove', function (data) {
      socket.broadcast.to(data.snid).emit("remove",data);
      loaded[data.snid].setContent(data.full);
    });

    socket.on('save', function (data) {
      console.log(socket.request)
      db.snippets.update(data.snid, loaded[data.snid].getContent(), function(err, info, content, title){
        console.log('Snippet %s updated.', data.snid);
      });
    });

    socket.on('insert', function (data) {
      socket.broadcast.to(data.snid).emit("insert",data);
      loaded[data.snid].setContent(data.full);
    });

    socket.on('cursorMove', function (data) {
      data.socketid = socket.id;
      console.log('Cursor Move: %s', data.snid);
      socket.broadcast.to(data.snid).emit("cursorMove",{ user : { username : socket.user.username, icon : socket.user.icon}, position : data });
      //console.log(socket.request.headers);
    });

  });

  console.log("SOCKET: IDE Sockets Initialized.");
  return this;
}











var userCount = function(){
  return connectionCount;
}

var add = function(gid, user, req, callback){
  db.snippets.count(function(err, count){
  	var hashids = new Hashids("Twoflower"),
    id = hashids.encode(count,Date.now());
    console.log(id)

    db.snippets.add(id,'',user,gid,function(err, id){
      console.log('IDE: New snippet, %s, added.', id);
      return callback(err, id);
    });

  });
}

var remove = function(id, callback){
  db.snippets.delete(id,function(err, id){
    console.log('IDE: Snippet, %s, deleted.', id);
    return callback(err, id);
  });
}

var get = function(snid, callback){
  var err = null;

  if(snid in loaded)
    return callback(err, loaded[snid].getContent());
  else
    db.snippets.get(snid, function(err, snippet){
      return callback(err, snippet.content);
    });


}


exports.start = start;
exports.init = init;
exports.get = get;
exports.remove = remove;
exports.add = add;
exports.userCount = userCount;
