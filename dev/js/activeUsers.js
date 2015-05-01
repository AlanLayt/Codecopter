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
    //  console.log(editor.selection.getSelectionAnchor())
      //console.log(editor.selection.getSelectionLead())
      //console.log(editor.selection.getCursor())
      pos.snid = snid;
      pos.select = editor.selection.getSelectionAnchor();
      socket.emit('IDE:Cursor',pos);
    });
    editor.scroll.on('changeScrollTop',function(){
      console.log('aksjgnajksgn')
      $scope.renderCursors($scope.cursors);
    });


    socket.on('IDE:Cursor', function (data) {
      console.debug("Incoming cursor: %s", data.user.username);
      $scope.proccessCursor(data);
    });
    socket.on('IDE:cursorList', function (data) {
      console.log('Cursor List loaded;');
      console.table(data.cursors);
      data.cursors.forEach(function(c){
      //  if(c.user.username != auth.getUser().username)
        //var cursor = $scope.addUser(c);
        $scope.proccessCursor(c);
      })
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
    $scope.renderCursors = function(crsrs){
      crsrs.forEach(function(c){
      //  console.log(c);
        c.pos.display = editor.renderer.textToScreenCoordinates(c.pos.carat.row,c.pos.carat.column);
        c.select.display = editor.renderer.textToScreenCoordinates(c.select.select.row,c.select.select.column);

        var lineheight = 10;
        console.log(c)
        for(var i=0; i<1;i++){
          console.log(c.select.display.pageY-c.pos.display.pageY)
        }

      });
    }

    $scope.proccessCursor = function(crsr){
      console.log(crsr)
      var checkUser = userExists(crsr.user.username);
      if(checkUser.cursor!==false){
        console.log('User exists. Updating position.');
        checkUser.cursor = {
          pos : {
            carat : crsr.position,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
          },
          select : {
            select : crsr.position.select,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
            boxes : []
          }
        }
      }
      else {
        var user = checkUser;//$scope.addUser(data.user);
        var cursor = $scope.addCursor({
          username : user.username,
          color : user.color,
          pos : {
            carat : crsr.position,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
          },
          select : {
            select : crsr.position.select,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
            boxes : []
          }
        });
        user.cursor = cursor;
      }
    }

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
