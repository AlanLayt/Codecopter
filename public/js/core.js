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
    var token;
    var colors = ['587D59','F9D189','AF734C','88C843','FA347B'];
    var snid = document.getElementById('editor').getAttribute('snid');
    console.log(snid);
    //var editor = element.find('#editor');
    var cursors = [];

    //was part of auth when it existed here
    auth.connect(function(){
      socket.emit('requestSnip', {snid : snid});
    });
    //

    socket.on('cursorMove', function (data) {
      console.debug("Incoming cursor: %s", data.user.username);
      if(!userExists(data.user.username))
        $scope.addUser(data.user);


      console.debug(data)
      var curhold = document.getElementById("cursorHold");
      curhold.innerHTML = '';
      var pos = editor.renderer.textToScreenCoordinates(data.position.row,data.position.column);
      //console.debug("Incoming cursor:");
      //console.debug(editor.renderer.textToScreenCoordinates(data.row,data.column));
      var colours = Array('B8006D','FF774C','3DA7D5');

      if(data.socketid in cursors){
        cursors[data.socketid].position.row = data.position.row;
        cursors[data.socketid].position.column = data.position.column;
      }
      else {
        cursors[data.socketid] = data;
        Object.keys($scope.users).forEach(function(key){
          if(data.user.username == $scope.users[key].username)
            color = $scope.users[key].color;
        });
        cursors[data.socketid].colour = color;//colours[Math.floor(Math.random()*3)];
      }

  //  console.debug(cursors)
      Object.keys(cursors).forEach(function(key){
        var pos = editor.renderer.textToScreenCoordinates(cursors[key].position.row,cursors[key].position.column);
        var obj = document.createElement('div');
        obj.id = "::img";
        var color;


        obj.style.cssText = 'position:absolute;top:' + pos.pageY + 'px;left:' + pos.pageX + 'px;width:0px;height:15px;border-left:3px  solid #'+cursors[key].colour+';-moz-box-shadow: 0px 0px 8px  #fff; display:'+(caretBlink?'block':'none')+';';
        cursors[key].el = obj;
        curhold.appendChild(obj);
      });
    });

    var caretBlink = false;
    console.log(cursors);
    var blinkProc = function(){
      caretBlink = caretBlink?false:true;
      var blinkTimer = window.setTimeout(blinkProc,800);
      Object.keys(cursors).forEach(function(key){
        cursors[key].el.style.display = caretBlink?'block':'none';
      });
    }
    blinkProc();
    editor.selection.on('changeCursor',function(){
      var pos = editor.selection.getCursor();
      pos.snid = snid;
      socket.emit('cursorMove',pos);
    });



    var userExists = function(username){
      var found = false;
      $scope.users.forEach(function(user){
        if(user.username == username)
          found = true;
      });
      return found;
    }

    $scope.users = [];

    $scope.addUser = function(user) {
      $scope.users.push({username : user.username, icon : user.icon, color : colors[Math.floor(Math.random()*colors.length)], done:false});
      //$scope.todoText = '';
    };
  }]
);
















app.controller('ide', ['$scope', '$http', 'socket', 'editor', function($scope,$http,socket,editor) {
  console.log('Development environment online.');
  var cursors = Array();
  var lastUpdate;
  console.debug(socket);
  var preview = new Preview('display');
      preview.update(editor.getValue());

  socket.on('insert', function (data) {
    lastUpdate = data;
    // Removed .getDocument() from before insert. May have broken things?
    editor.session.insert(data.range.start,data.text);
    preview.update(editor.getValue());
  });
  socket.on('remove', function (data) {
    lastUpdate = data;
    editor.session.remove(data.range);
    preview.update(editor.getValue());
  });
  socket.on('disconnect', function () {
    socket.disconnect();
    console.debug("Connection Lost. Reloading.");
    var test = window.setTimeout(function(){location.reload()},1000);
  });

  socket.on('loadSnip', function (data) {
    editor.setValue(data.snippet.content);
  });

  editor.on("change", function(e){
    var content = editor.getValue();
    console.debug(lastUpdate);
    if( lastUpdate !== 'undefined' || lastUpdate===false
        || (e.data.text != lastUpdate.text
        || e.data.range.start.column != lastUpdate.range.start.column
        || e.data.range.start.row != lastUpdate.range.start.row )){

      var data = e.data;
      data.full = editor.getValue();
      data.snid = snid;

      switch(e.data.action){
        case 'insertText':
          socket.emit('insert', data);
          break;
        case 'removeText':
          socket.emit('remove', data);
          break;
      }
      preview.update(editor.getValue());
      preview.resetTicker();
    }
  });


  document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
      e.preventDefault();
      console.debug('Saving.');
      var details = document.getElementById("details");
      socket.emit('save', { snid : snid, content : editor.getValue()});
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
    $http.post('http://'+window.location.hostname+':8888/snippet/update',{
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

        $http.get('http://'+window.location.hostname+':8888/auth/key')
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
  }
  this.refresh = function(){
    this.el.src = "data:text/html;charset=utf-8,"+escape(this.content);
  }
  this.tick = function(preview,callback){

    //console.log(preview.running)
    if(preview.ut<preview.updateTimeout || !preview.running)
        preview.ut+=preview.tickStep;
    else {
      preview.running = false;
      preview.ut=0;
      callback();
      preview.refresh();
    }
    //console.debug("Tick %ds", preview.ut/1000);
    var ticker = setTimeout(preview.tick,preview.tickStep,preview,callback);

  }

  this.resetTicker = function(){
    this.ut=0;
    this.running = true;
    //console.log("Resetting timer");
  }

  this.tick(this,function(){})
}
