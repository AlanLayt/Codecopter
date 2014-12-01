var app,io,db;
var url = require('url');
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
        db.getSnippet(data.snid,function(snippet){
          if(snippet.length<1){
            db.addSnippet(data.snid,'',function(){
              console.log('IDE: New snippet, %s, added.', data.snid);
            });
            loaded[data.snid] = '';
          } else {
            loaded[data.snid] = snippet[0].content;
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
      db.updateSnippet(data.snid, loaded[data.snid], function(info,content,title){
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
      console.log('cursormove');
    });

  });

  console.log("SOCKET: IDE Sockets Initialized.");
  return this;
}

var userCount = function(){
  return clientNum;//io.clients().length;
}

var getSnippet = function(snid,callback){
  if(snid in loaded)
    callback(loaded[snid]);
  else 
    db.getSnippet(snid,function(snippet){
      var snp = '';
      if(snippet.length>0)
        snp = snippet[0].content;

      callback(snp);
    });
}


exports.start = start;
exports.init = init;
exports.getSnippet = getSnippet;
exports.userCount = userCount;