var snid;
var app = angular.module('CodeLight', []);

window.addEventListener("DOMContentLoaded", function() {
  var el = document.getElementById('editor');
  if(el!==null)
    snid = el.getAttribute('snid');


  var search = document.getElementById('Search');
  if(search!==null){
    var es = document.getElementsByClassName("searchCodeDisplay");
    //  console.log(es[0])
    for(var i=0;i<es.length;i++){
      console.log(es[i]);
      var editor = ace.edit(es[i]);
      editor.setTheme("ace/theme/monokai");
      editor.renderer.setShowGutter(false);
      editor.getSession().setMode("ace/mode/javascript");
    };
  }

}, false);


var Preview = function(element){
  this.el = document.getElementById(element);
  this.content = "";
  this.ut = 0;
  this.tickStep = 100;
  this.updateTimeout = 300;
  this.running = true;
  this.liveView = true;

  this.update = function(val,snid){
    this.content = val;
    return this;
  }
  this.refresh = function(){
    var src = this.liveView?'http://'+window.location.hostname+':' + window.location.port + '/s/' + snid : "data:text/html;charset=utf-8,"+escape(this.content);
    this.el.src = src;
  }
  this.tick = function(preview,callback){
    if(preview.ut<preview.updateTimeout || !preview.running)
        preview.ut+=preview.tickStep;
    else {
      preview.running = false;
      preview.ut=0;
      callback();
      preview.refresh();
    }
    var ticker = setTimeout(preview.tick,preview.tickStep,preview,callback);
  }

  this.resetTicker = function(){
    this.ut=0;
    this.running = true;
  }

  this.tick(this,function(){});
}
;app.controller('activeUsers', ['$scope', '$http', 'socket', 'editor', 'auth', function($scope,$http,socket,editor,auth) {
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
        var rows, start,
          adjpx = 7;

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
              width : editor.renderer.getSize().width - start.display.pageX - adjpx,
            });
            for(var i=1; i<rows;i++){
              c.select.boxes.push({
                left : editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageX - adjpx,
                top : editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageY,
                width : editor.renderer.getSize().width - editor.renderer.textToScreenCoordinates(start.position.row+i,0).pageX,
              });
            }
            c.select.boxes.push({
              left : editor.renderer.textToScreenCoordinates(end.position.row,0).pageX - adjpx,
              top : end.display.pageY,
              width : end.display.pageX - editor.renderer.textToScreenCoordinates(end.position.row,0).pageX + adjpx,
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
;app.factory('auth', ['$http', 'socket', function authFactory($http, socket) {
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
    },
    isLogged : function(){
      return logged;
    }
  }
}]);
;
app.directive("contenteditable", function() {
  return {
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
});



app.directive('parseUrl', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        scope: {
            ngModel: '=ngModel'
        },
        link: function compile(scope, element, attrs, controller) {
            scope.$watch('ngModel', function (value) {
                var html = value.replace(urlPattern, '<a href="$&">$&</a>');
                element.html(html);
            });
        }
    };
});
;app.controller('display', ['$scope', '$http', 'auth', function($scope,$http,auth) {
  $scope.editForm = {};
  $scope.commentForm = {
    content : 'Leave a comment...',
    active : false
  };

  auth.connect(function(){
    console.debug(auth.getUser());
  });

  var el = document.getElementById('Display');
  if(el!==null)
    snid = el.getAttribute('snid');


  $scope.edit = function(){
    if(auth.isLogged())
      $scope.editing = true;
  }


  $scope.activateComments = function(){
    if(!$scope.commentForm.active){
      $scope.commentForm.content = '';
      $scope.commentForm.active = true;
    }
  }
  $scope.unactComments = function(){
    if($scope.commentForm.active){
      $scope.commentForm.content = 'Leave a comment...';
      $scope.commentForm.active = false;
    }
  }

  $scope.updateDetails = function(form){
    console.log('Modifying %s', snid);
    $http.post('http://'+window.location.hostname+':' + window.location.port + '/snippet/update',{
      snid : snid,
      title : $scope.editForm.title,
      desc : $scope.editForm.description
    }).success(function(data){
        console.log('Details updated');
        $scope.editing = false;
        var test = window.setTimeout(function(){location.reload()},1);
      })
  }

  $scope.addComment = function(form){
    console.log('Adding to %s comment: %s', snid, $scope.commentForm.content);

    $http.post('http://'+window.location.hostname+':' + window.location.port + '/comment/post',{
      snid : snid,
      comment : $scope.commentForm.content
    }).success(function(data){
        console.log('Comment Posted');
        var test = window.setTimeout(function(){location.reload()},1);
      })
  }

  console.log('Displaying "%s".', snid);
}]);
;app.controller('groups', ['$scope', '$http', 'auth', function($scope,$http,auth) {
  $scope.editForm = {};
  $scope.newGroup = {
    title : '',
    description : '',
    active : false
  };

  auth.connect(function(){
    console.debug(auth.getUser());
  });

  $scope.update = function(){
    if($scope.newGroup.title.length>0 && $scope.newGroup.description.length>0)
      $scope.newGroup.active = true;
    else
      $scope.newGroup.active = false;

    console.log
  }

  $scope.activateNewGroup = function(){
    if(!$scope.newGroup.active){
      $scope.newGroup.content = '';
      $scope.newGroup.active = true;
    }
  }
  $scope.unactNewGroup = function(){
    if($scope.newGroup.active){
      $scope.newGroup.content = 'Leave a comment...';
      $scope.newGroup.active = false;
    }
  }
  console.log('Groups loaded');
}]);
;app.controller('ide', ['$scope', '$http', 'socket', 'editor', function($scope,$http,socket,editor) {
  console.log('Development environment online.');
  var cursors = Array();
  var lastUpdate;
  var loaded = false,
  snid = document.getElementById('editor').getAttribute('snid');
  //console.debug(socket);
  var preview = new Preview('display');
      preview.update(editor.getValue());

  socket.on('IDE:Insert', function (data) {
    lastUpdate = data;
    console.log('insert')
    // Removed .getDocument() from before insert. May have broken things?
    editor.session.insert(data.range.start,data.text);
    prev();
  });
  socket.on('IDE:InsertLines', function (data) {
    lastUpdate = data;
    editor.session.insertLines(data.range.start.row,data.lines);
    prev();
  });
  socket.on('IDE:Remove', function (data) {
    lastUpdate = data;
    editor.session.remove(data.range);
    prev();
  });
  socket.on('IDE:LoadSnip', function (data) {
    console.debug('Loaded snippet.')
    loaded = true;
  });


  editor.on("change", function(e){
    var content = editor.getValue();

    if( lastUpdate !== 'undefined' || lastUpdate===false
        || (e.data.text != lastUpdate.text
        || e.data.range.start.column != lastUpdate.range.start.column
        || e.data.range.start.row != lastUpdate.range.start.row )){

      var data = e.data;
      data.full = editor.getValue();
      data.snid = snid;

    //  console.log(e);
      switch(e.data.action){
        case 'insertText':
          socket.emit('IDE:Insert', data);
          break;
        case 'insertLines':
          socket.emit('IDE:InsertLines', data);
          break;
        case 'removeText':
          socket.emit('IDE:Remove', data);
          break;
        case 'removeLines':
          socket.emit('IDE:Remove', data);
          break;
      }
      prev();
  //    console.debug(snid);
    }
  });

  var prev = function(){
    preview.update(editor.getValue(),snid).resetTicker();
  }


  document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
      e.preventDefault();
      console.debug('Saving.');
      socket.emit('IDE:Save', { snid : snid, content : editor.getValue()});
    }
  }, false);

}]);
;app.factory('socket', function ($rootScope) {
    var socket = io(window.location.host,{ reconnection : false });
    window.socket = socket; //needs removed
    console.log('Initializing socket for angular');
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      disconnect: function (callback) {
        socket.disconnect(function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
});

app.factory('editor', function ($rootScope) {
    var caretBlink = false;

    // Ace Initialization
    var lastUpdate = false;
    ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
    editor.session.setMode("ace/mode/html");
    editor.setTheme("ace/theme/dreamweaver");

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });

    console.log('Initializing Ace editor.');
    return {
      getValue: function () {
        return editor.getValue();
      },
      setValue: function (v) {
        console.log('setvalue %s', v)
        editor.setValue(v,0);
      },
      on : function(evt,callback){
        editor.on(evt,function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
        //editor.on(evt,callback);
      },
      scroll : {
        on : function(evt,callback){
          console.log(editor.getSession())
          editor.getSession().on(evt,function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        },
      },
      session : {
        insert : function(start,text){
          editor.session.insert(start,text);
        },
        insertLines : function(start,lines){
          editor.session.getDocument().insertLines(start,lines);
        },
        remove : function(range){
          editor.session.getDocument().remove(range);
        },
        getScreenLastRowColumn: function(r){
          return editor.session.getScreenLastRowColumn(r);
        }
      },
      selection : {
        on : function(evt,callback){
          editor.selection.on(evt,function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          })
        },
        getCursor : function(){
          return editor.selection.getCursor();
        },
        getSelectionAnchor : function(){
          return editor.selection.getSelectionAnchor();
        },
        getSelectionLead : function(){
          return editor.selection.getSelectionLead();
        },
        getAllRanges : function(){
          return editor.selection.getAllRanges();
        }
      },
      renderer : {
        textToScreenCoordinates : function(row,col){
          return editor.renderer.textToScreenCoordinates(row,col);
        },
        getContainerElement : function(){
          return editor.renderer.getContainerElement();
        },
        getSize : function(){
          return editor.renderer.$size;
        }
      }
    };
});
