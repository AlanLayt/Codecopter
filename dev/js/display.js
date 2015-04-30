app.controller('display', ['$scope', '$http', 'auth', function($scope,$http,auth) {
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
