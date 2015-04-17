module.exports = function(details){
  var details = details;

  this.getName = function(){
    return details.username;
  }
  this.getIcon = function(){
    return details.icon;
  }
}
