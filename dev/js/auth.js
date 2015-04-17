app.factory('auth', ['$http', 'socket', function authFactory($http, socket) {
  var user = null,
      logged = null;


  return {
    connect : function(callback){
      socket.on('AUTH:Connected', function () {
        console.log('SOCKET: Connection Success.');

        $http.get('http://'+window.location.hostname+':' + window.location.port + '/auth/key')
        .success(function(data){
          console.log('SOCKET: Token retrieved.');
          socket.emit('AUTH:Key',{token:data.token});
        });
      });
      socket.on('AUTH:Verified', function (data) {
        console.log('SOCKET: Verified as %s.', data.user.username);
        user = data.user;
        logged = true;
        callback(null,user);
      }); 
      socket.on('AUTH:Denied', function (data) {
        console.log('SOCKET: Unverified.');
        logged = false;
        callback({logged:false},null)
      });

      socket.on('disconnect', function () {
        //socket.close();
        socket.disconnect();
        console.debug("Connection Lost. Reloading.");
        var test = window.setTimeout(function(){location.reload()},1000);
      });
    },
    getUser : function(){
      return user;
    }
  }
}]);
