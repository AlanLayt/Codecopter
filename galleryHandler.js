var app,io,db;
var url = require('url');
var loaded = Array();

var init = function(mapp,mio,mdb){
  app = mapp,
  io = mio,
  db = mdb;

  start();
  console.log('GALLERY: Initialized');
}

var start = function(){
  
}




exports.start = start;
exports.init = init;