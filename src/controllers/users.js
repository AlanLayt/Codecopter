var app,io,db,auth,
  User = require('./user'),
  users = new Array();

var init = function(options){
  app = options.app,
  io = options.io,
  db = options.db;
  auth = options.handlers.auth;

  start();
  console.log('USERS: Initialized');
  return true;
}

var start = function(){

  io.on('connection', function (socket) {
    socket.user = false;//{username : false};

    socket.on('disconnect', function () {
      if(socket.user){
        // Remove user if no clients remain for user
      }
    });

    socket.on('AUTH:Key', function (data) {
      var details = auth.decodeKey(data.token);

      if(details.logged !== false){
          if(details.user.username in users){
          //  console.log('User active; %s', users[details.user.username].getName());
          }
          else {
            users[details.user.username] = new User(details.user);
            console.log('%s[%s] connected.', details.user.username, socket.id);
          }

          socket.user = users[details.user.username];

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
