var app,io,db,auth,handlers,
    Snippet = require('./snippet');

var init = function(options){
  app = options.app,
  io = options.io,
  db = options.db;
  auth = options.auth;
  handlers = options.handlers;

  start();
  console.log('IDE: Initialized');
  return true;
}

var start = function(){



  io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      if(socket.user && socket.snippet){
        socket.snippet.removeUser(socket.user);
        socket.broadcast.to(socket.snippet.getID()).emit("IDE:userDisconnect",{
          username : socket.user.getName()
        });
      }
    });
    // Handles request for whole snippet and sends resulting snippet
    socket.on('IDE:RequestSnip', function (data) {
      handlers.snippets.get(data.snid,function(err,s){
        socket.emit("IDE:LoadSnip",{ content : s.getContent() });
        socket.join(data.snid);
        socket.snippet = s;
        if(socket.user) {
          var usrs = [];

          s.addUser(socket.user);

          Object.keys(s.getUsers()).forEach(function(key, index) {
            usrs.push({
              username : this[key].getName(),
              icon : this[key].getIcon()
            });
          }, s.getUsers());

          socket.broadcast.to(socket.snippet.getID()).emit("IDE:userConnect",{
            user : {
              username : socket.user.getName(),
              icon : socket.user.getIcon()
            }
          });

          socket.emit("IDE:userList",{ users : usrs });
        }
      })
    });

    // Handles remove request and brodcasts to other connected clients
    socket.on('IDE:Remove', function (data) {
      socket.broadcast.to(data.snid).emit("IDE:Remove",data);
      handlers.snippets.get(data.snid,function(err,s){
        s.setContent(data.full);
      });
    });
    socket.on('IDE:Insert', function (data) {
      socket.broadcast.to(data.snid).emit("IDE:Insert",data);
      handlers.snippets.get(data.snid,function(err,s){
        s.setContent(data.full);
      });
    });
    socket.on('IDE:InsertLines', function (data) {
      socket.broadcast.to(data.snid).emit("IDE:InsertLines",data);
      console.log(data.lines)
      handlers.snippets.get(data.snid,function(err,s){
        s.setContent(data.full);
      });
    });

    socket.on('IDE:Save', function (data) {
      handlers.snippets.save(data.snid,function(err,id){
        console.log('Snippet %s updated.', id);
      });
    });


    socket.on('IDE:Cursor', function (data) {
      //console.log('Cursor Move: %s', data.snid);
      if(socket.user)
      socket.broadcast.to(data.snid).emit("IDE:Cursor",{
        socketid : socket.id,
        user : {
          username : socket.user.getName(),
          icon : socket.user.getIcon()
        },
        position : data });
      //console.log(socket.request.headers);
    });



    socket.on('IDE:chatMessage', function (data) {
      socket.broadcast.to(socket.snippet.getID()).emit("IDE:chatMessage",{
        msg : data.msg,
        user : socket.user.getBasicDetails()
      });
    });

  });

  console.log("SOCKET: IDE Sockets Initialized.");
  return this;
}





var add = function(gid, user, req, callback){
  handlers.snippets.add({
    user : user,
    group : gid
  }, function(err,id){
    console.log('IDE: New snippet %s added.', id);
    callback(err, id)
  });
}

var remove = function(id, callback){
  handlers.snippets.remove(id,function(err, id){
    console.log('IDE: Snippet %s deleted.', id);
    return callback(err, id);
  });
}



exports.start = start;
exports.init = init;
exports.remove = remove;
exports.add = add;
