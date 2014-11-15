

var setEvents = function(){
  console.log("Initializing IDE Events.");


  console.log("Socket Initializing.");

  
  io.on('connection', function (socket) {
    console.log('User Connected. (' + socket.id + ')');

    socket.emit("connectionConfirmed",{content : GLOBAL.test});

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

}



exports.setEvents = setEvents;
