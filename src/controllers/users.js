var app,io,db,auth,
  User = require('./user'),
  users = new Array(),
  connectionCount=0;

var init = function(mapp,mio,mdb,msess,mauth){
  app = mapp,
  io = mio,
  db = mdb;
  auth = mauth;

  start();
  console.log('USERS: Initialized');
  return true;
}

var start = function(){

  io.on('connection', function (socket) {
    connectionCount++;
    socket.user = {username : false};

    socket.on('disconnect', function () {
      connectionCount--;
    });

    socket.on('AUTH:Key', function (data) {
      var details = auth.decodeKey(data.token);
      if(details.logged !== false){
          socket.user = details.user;
          console.log('%s[%s] connected.', details.user.username, socket.id);
          socket.emit("AUTH:Verified",{ user : details.user, logged : true });
      }
      else
        socket.emit("AUTH:Denied",{ logged : false });
    });

    socket.emit("AUTH:Connected",{});
  });

}



module.exports = {
  init : init,
}
