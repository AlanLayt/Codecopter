module.exports = function(details){
  var details = details;

  this.getName = function(){
    return details.username;
  }
  this.getIcon = function(){
    //console.log(details)
    return details.icon;
  }
}
