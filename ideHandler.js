var app,io,db;
var url = require('url');

var init = function(mapp,mio,mdb){
  app = mapp,
  io = mio,
  db = mdb;

  start();
  console.log('IDE: Initialized');
}

var start = function(){
  
  io.on('connection', function (socket) {
    console.log('User Connected. (' + socket.id + ')');



    socket.emit("connectionConfirmed",{content : GLOBAL.test});

    // Handles request for whole snippet and sends resulting snippet
    socket.on('requestSnip', function (data) {
      db.getSnippet(data.snid,function(snippet){
        socket.emit("loadSnip",{snippet : snippet[0]});
      });
    });

    // Handles remove request and brodcasts to other connected clients
    socket.on('remove', function (data) {
      socket.broadcast.emit("remove",data);
      GLOBAL.test = data.full;
    });

    socket.on('insert', function (data) {
      socket.broadcast.emit("insert",data);
      GLOBAL.test = data.full;

      db.updateSnippet("test", GLOBAL.test, function(info,snippet,content){
        console.log("Snippet updated.");
      });
    });
    socket.on('disconnect', function () {
      console.log('Connection lost. (' + socket.id + ')');
    });

  });

  console.log("SOCKET: IDE Sockets Initialized.");
  return this;
}



exports.start = start;
exports.init = init;
