var snid;
var app = angular.module('userController', []);

window.addEventListener("DOMContentLoaded", function() {
  snid = document.getElementById('editor').getAttribute('snid');
}, false);

app.controller('activeUsers', ['$scope', '$http', 'socket', function($scope,$http,socket) {
    var token;
    var colors = ['587D59','F9D189','AF734C','88C843','FA347B'];

    socket.on('connectionConfirmed', function (data) {
      console.log('Angular Connection Success');
      socket.emit('requestSnip', {snid : snid});

      $http.get('http://127.0.0.1:8888/auth/key')
        .success(function(data){
          token = data.token;
          socket.emit('authKey',{token:token});
        })
    });

    socket.on('disconnect', function () {
      socket.disconnect();
      console.debug("Connection Lost. Reloading.");
      var test = window.setTimeout(function(){location.reload()},1000);
    });

    socket.on('cursorMove', function (data) {
      console.debug("Incoming cursor: %s", data.user.username);
      if(!userExists(data.user.username))
        $scope.addUser(data.user);
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
