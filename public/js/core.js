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
        console.log(c);
        c.pos.display = editor.renderer.textToScreenCoordinates(c.pos.carat.row,c.pos.carat.column);
      });
    }

    $scope.proccessCursor = function(crsr){
      var checkUser = userExists(crsr.user.username);
      if(checkUser.cursor!==false){
        console.log('User exists. Updating position.');
        checkUser.cursor = {
          pos : {
            carat : crsr.position,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
          },
          select : {
            select : crsrs.select,
            display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column)
          }
        }
      }
      else {
        var user = checkUser;//$scope.addUser(data.user);
        var cursor = $scope.addCursor({
          username : user.username,
          color : user.color,
          pos : {
            pos : {
              carat : crsr.position,
              display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column),
            },
            select : {
              select : crsrs.select,
              display : editor.renderer.textToScreenCoordinates(crsr.position.row,crsr.position.column)
            }
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

      console.log(e);
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
      console.debug(snid);
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
        }
      },
      renderer : {
        textToScreenCoordinates : function(row,col){
        return editor.renderer.textToScreenCoordinates(row,col);
        }
      }
    };
});
