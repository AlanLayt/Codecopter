var app,io,db;
var url = require('url');
var loaded = Array(),
  Hashids = require('hashids'),
  hashids = new Hashids("Twoflower");

var init = function(mapp,mio,mdb){
  app = mapp,
  io = mio,
  db = mdb;

  start();
  console.log('SNIPPETS: Initialized');
}

var start = function(){

}

var listAll = function(callback){
}

var get = function(gid,callback){
}

var add = function(group){
}
var search = function(search, callback){
  console.log('searching.');
  var result = {};
  db.snippets.search(search,function(err, result){
    result.forEach(function(s){
      var lines = s.content.split('\n');
      s.search = {
        result : ''
      };
      lines.forEach(function(line,k){
        console.log(line.indexOf(search)>-1)
        if(line.indexOf(search)>-1)
          s.search.result += line.trim() + '\n';
//          console.log('%s: %s',k+1,line);
      });
    })
    callback(err, result);
  });
}



exports.start = start;
exports.init = init;

exports.add = add;
exports.get = get;
exports.search = search;
exports.listAll = listAll;
