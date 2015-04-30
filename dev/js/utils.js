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
