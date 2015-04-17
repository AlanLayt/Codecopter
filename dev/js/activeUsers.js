app.controller('activeUsers', ['$scope', '$http', 'socket', 'editor', 'auth', function($scope,$http,socket,editor,auth) {
    var token,
        colors = ['587D59','F9D189','AF734C','88C843','FA347B'],
        snid = document.getElementById('editor').getAttribute('snid');
    $scope.cursors = [];
    $scope.users = [];
    $scope.messages = [];

    auth.connect(function(){
      socket.emit('IDE:RequestSnip', {snid : snid});
    });

    editor.selection.on('changeCursor',function(){
      var pos = editor.selection.getCursor();
      pos.snid = snid;
      socket.emit('IDE:Cursor',pos);
    });
    socket.on('IDE:Cursor', function (data) {
      console.debug("Incoming cursor: %s", data.user.username);

      var checkUser = userExists(data.user.username);
      if(checkUser.cursor!==false){
        console.log('User exists. Updating position.');
        checkUser.cursor.pos = {
          carat : data.position,
          display : editor.renderer.textToScreenCoordinates(data.position.row,data.position.column)
        }
      }
      else {
        var user = checkUser;//$scope.addUser(data.user);
        var cursor = $scope.addCursor({
          username : user.username,
          color : user.color,
          pos : {
            carat : data.position,
            display : editor.renderer.textToScreenCoordinates(data.position.row,data.position.column)
          }
        });
        user.cursor = cursor;
      }
    });
    socket.on('IDE:userList', function (data) {
      console.log('User List loaded;');
      console.table(data.users);
      data.users.forEach(function(u){
        if(u.username != auth.getUser().username)
          var user = $scope.addUser(u);
      })
    });
    socket.on('IDE:userDisconnect', function (data) {
      $scope.removeUser(data.username);
      $scope.removeCursor(data.username);

      console.log('%s disconnected', data.username);
    });
    socket.on('IDE:userConnect', function (data) {
      //console.log(data);
      if(data.user.username != auth.getUser().username)
        $scope.addUser(data.user);

      console.log('%s connected.', data.user.username);
    });




    socket.on('IDE:chatMessage', function (data) {
      $scope.messages.push({
        content : data.msg,
        user : data.user
      });
    });

    var userExists = function(username){
      var found = false;
      $scope.users.forEach(function(user){
        if(user.username == username)
          found = user;
      });
      return found;
    }




    $scope.typing = function(){
      //console.log($scope.message)
    }
    $scope.chatSend = function(){
      console.log($scope.message);
      socket.emit('IDE:chatMessage', {msg : $scope.message});
      $scope.messages.push({
        content : $scope.message,
        user : auth.getUser()
      });
      $scope.message = '';
    }


    $scope.removeUser = function(user) {
      $scope.users.forEach(function(u,i){
        if(u.username == user){
          $scope.users.splice(i,1);
        }
      });
    }


    $scope.addUser = function(user) {
      var userObj = {
        username : user.username,
        icon : user.icon,
        color : colors[Math.floor(Math.random()*colors.length)],
        done:false,
        cursor:false
      };

      $scope.users.push(userObj);
      return userObj;
    };

    $scope.addCursor = function(cursor) {
      var cursorObj = cursor;

      $scope.cursors.push(cursorObj);
      return cursorObj;
    };
    $scope.removeCursor = function(user) {
      $scope.cursors.forEach(function(c,i){
        if(c.username == user){
          $scope.cursors.splice(i,1);
        }
      });
    }
  }]
);
