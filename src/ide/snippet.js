 module.exports = function(details){
   var details = details;

   this.getTitle = function(){
     return details.title;
   }
   this.getContent = function(){
     return details.content;
   }

   this.setContent = function(content){
     details.content = content;
   }
 }
