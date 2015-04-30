module.exports = function(details){
  var details = details;
  var users = new Array();
  var cursors = new Array();

  this.getTitle = function(){
    return details.title;
  }
  this.getID = function(){
    return details.id;
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
  this.getAuthor = function(){
    return details.user;
  }
  this.addUser = function(u){
    if(u.getName() in users){
    //  console.log('%s: %s already active.', this.getTitle(),u.getName())
    }
    else {
      console.log('%s: %s now active.',this.getTitle(),u.getName())
      users[u.getName()] = u;
    }
  }
  this.removeUser = function(u){
    if(u.getName() in users){
      delete users[u.getName()];
      console.log('%s: %s has disconnected.', this.getTitle(),u.getName())
    }
    else {
    }
  }
  this.getUsers = function(){
    return users;
  }

  this.addCursor = function(cursor){
    if(cursor.user.getName() in cursors){
    //  console.log('%s: %s already active.', this.getTitle(),u.getName())
    }
    else {
      //console.log('%s: %s now active.',this.getTitle(),u.getName())
      cursors[cursor.user.getName()] = cursor;
    }
  }
  this.removeCursor = function(user){
    if(user.getName() in cursors){
      delete cursors[user.getName()];
      //console.log('%s: %s has disconnected.', this.getTitle(),u.getName())
    }
    else {
    }
  }
  this.getCursors = function(){
    return cursors;
  }

  this.setContent = function(content){
    details.content = content;
  }
}
