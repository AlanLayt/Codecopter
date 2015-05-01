app.controller('groups', ['$scope', '$http', 'auth', function($scope,$http,auth) {
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
