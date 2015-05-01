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

    editor.on("change", function(e){
      $scope.renderCursors($scope.cursors);
    });
    editor.selection.on('changeCursor',function(){
      sendCursor();
    });
    editor.selection.on('changeSelection',function(){
      sendCursor();
    });
    var sendCursor = function(){
      var pos = {
        snid : snid,
        carat : editor.selection.getCursor(),
        select : editor.selection.getSelectionAnchor()
      };
      socket.emit('IDE:Cursor',pos);
    }
    editor.scroll.on('changeScrollTop',function(){
      $scope.renderCursors($scope.cursors);
    });
    editor.scroll.on('changeScrollLeft',function(){
      $scope.renderCursors($scope.cursors);
    });


    socket.on('IDE:Cursor', function (data) {
    //  console.debug("Incoming cursor: %s", data.user.username);
      $scope.proccessCursor(data);
      $scope.renderCursors($scope.cursors);
    });
    socket.on('IDE:cursorList', function (data) {
      console.log('Cursor List loaded;');
      console.table(data.cursors);
      data.cursors.forEach(function(c){
      //  if(c.user.username != auth.getUser().username)
        //var cursor = $scope.addUser(c);
        $scope.proccessCursor(c);
      })
      $scope.renderCursors($scope.cursors);
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
    //console.log(crsrs)
      crsrs.forEach(function(c){
        var rows, start;

        var selection = !(c.select.position.column == c.carat.position.column && c.select.position.row == c.carat.position.row);

        c.carat.display = editor.renderer.textToScreenCoordinates(c.carat.position.row,c.carat.position.column);
        c.select.display = editor.renderer.textToScreenCoordinates(c.select.position.row,c.select.position.column);

        c.select.boxes = [];


        if(c.carat.position.row > c.select.position.row){
          start = c.select;
          end = c.carat;
        }
        else {
          start = c.carat;
          end = c.select;
        }
      //  console.log(c);
      //  console.log(selection)

        rows = end.position.row - start.position.row;

        if(selection){
          if(rows>0){
            c.select.boxes.push({
              left : start.display.pageX,
              top : start.display.pageY,
              width : editor.renderer.getSize().width - start.display.pageX,
            });
            for(var i=1; i<rows;i++){
              c.select.boxes.push({
                left : editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageX,
                top : editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageY,
                width : editor.renderer.getSize().width - editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageX,
              });
            }
            c.select.boxes.push({
              left : editor.renderer.textToScreenCoordinates(end.position.row,0).pageX,
              top : end.display.pageY,
              width : end.display.pageX - editor.renderer.textToScreenCoordinates(end.position.row,0).pageX,
            });
          }
          else {
            if(c.carat.position.column > c.select.position.column){
              start = c.select;
              end = c.carat;
            }
            else {
              start = c.carat;
              end = c.select;
            }
            c.select.boxes.push({
              left : start.display.pageX,
              top : start.display.pageY,
              width : end.display.pageX - start.display.pageX,
            });
          }
        }

      });
    }

    $scope.proccessCursor = function(crsr){
      var user = userExists(crsr.user.username);
      var cursor = {
        user : user,
        carat : {
          position : crsr.carat,
          display : editor.renderer.textToScreenCoordinates(crsr.carat.row,crsr.carat.column),
        },
        select : {
          position : crsr.select,
          display : editor.renderer.textToScreenCoordinates(crsr.select.row,crsr.select.column),
          boxes : []
        }
      }

      console.log(cursor)

      user.cursor = cursor;

    //  console.log(user.cursor)
      if($scope.cursorExists(user.username)===false){
        console.log('New cursor. Adding to array');
        var cr = $scope.addCursor(user.cursor);
      }
      else {
      var cr = $scope.updateCursor(user.cursor);
      }

    }

    $scope.addCursor = function(cursor) {
      var cursorObj = cursor;

      //console.log(cursorObj)
      $scope.cursors.push(cursorObj);
      return cursorObj;
    };
    $scope.removeCursor = function(user) {
      $scope.cursors.forEach(function(c,i){
        if(c.user.username == user){
          $scope.cursors.splice(i,1);
        }
      });
    }
    $scope.updateCursor = function(cursor) {
      $scope.cursors.forEach(function(c,i){
        if(c.user.username == cursor.user.username){
          $scope.cursors[i] = cursor
        }
      });
    }
    $scope.cursorExists = function(user) {
      var result = false;
      $scope.cursors.forEach(function(c,i){
        if(c.user.username == user){
          result = true;
        }
      });
      return result;
    }
  }]
);
