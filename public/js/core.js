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









app.controller('activeUsers', ['$scope', '$http', 'socket', 'editor', 'auth', function($scope,$http,socket,editor,auth) {
    var token,
        colors = ['587D59','F9D189','AF734C','88C843','FA347B'],
        snid = document.getElementById('editor').getAttribute('snid');

    $scope.cursors = [];
    $scope.users = [];

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
      if(checkUser!==false){
        console.log('User exists. Updating position.');
        checkUser.cursor.pos = {
          carat : data.position,
          display : editor.renderer.textToScreenCoordinates(data.position.row,data.position.column)
        }
      }
      else {
        var user = $scope.addUser(data.user);
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


    var userExists = function(username){
      var found = false;
      $scope.users.forEach(function(user){
        if(user.username == username)
          found = user;
      });
      return found;
    }


    $scope.addUser = function(user) {
      var userObj = {
        username : user.username,
        icon : user.icon,
        color : colors[Math.floor(Math.random()*colors.length)],
        done:false
      };

      $scope.users.push(userObj);
      return userObj;
    };

    $scope.addCursor = function(cursor) {
      var cursorObj = cursor;

      $scope.cursors.push(cursorObj);
      return cursorObj;
    };
  }]
);
















app.controller('ide', ['$scope', '$http', 'socket', 'editor', function($scope,$http,socket,editor) {
  console.log('Development environment online.');
  var cursors = Array();
  var lastUpdate;
  var loaded = false;
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
    }
  });

  var prev = function(){
    preview.update(editor.getValue()).resetTicker();
  }


  document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
      e.preventDefault();
      console.debug('Saving.');
      socket.emit('IDE:Save', { snid : snid, content : editor.getValue()});
    }
  }, false);

}]);












app.controller('display', ['$scope', '$http', 'auth', function($scope,$http,auth) {
  $scope.editForm = {};

  auth.connect(function(){
    console.debug(auth.getUser());
  });

  var el = document.getElementById('Display');
  if(el!==null)
    snid = el.getAttribute('snid');


  $scope.edit = function(){
    console.log("Opening edit")
    $scope.editing = true;
  }

  $scope.submit = function(form){
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

  console.log('Displaying "%s".', snid);
}]);





























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

app.factory('socket', function ($rootScope) {
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
        }
      },
      renderer : {
        textToScreenCoordinates : function(row,col){
        return editor.renderer.textToScreenCoordinates(row,col);
        }
      }
    };
});











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



var Preview = function(element){
  this.el = document.getElementById(element);
  this.content = "";
  this.ut = 0;
  this.tickStep = 100;
  this.updateTimeout = 300;
  this.running = true;

  this.update = function(val){
    this.content = val;
    return this;
  }
  this.refresh = function(){
    this.el.src = "data:text/html;charset=utf-8,"+escape(this.content);
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
