module.exports = function(details){
  var details = details;
  
  this.getTitle = function(){
    return details.title;
  }
  this.getDesc = function(){
    return details.desc;
  }
  this.getContent = function(){
    return details.content;
  }
  this.getDetails = function(){
    return details;
  }
  this.getUser = function(){
    return details.user;
  }

  this.setContent = function(content){
    details.content = content;
  }
}
