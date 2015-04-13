var app,io,db;
var loaded = Array(),
  Hashids = require('hashids'),
  Snippet = require('./snippet'),
  hashids = new Hashids("Twoflower");

var init = function(mapp,mio,mdb){
  app = mapp,
  io = mio,
  db = mdb;

  start();
  console.log('SNIPPETS: Initialized');
  return true;
}

var start = function(){

}

var listAll = function(callback){
  db.snippets.listAll(function(err,snippets){
    return callback(err,snippets);
  });
}

var get = function(snid,callback){
  var err = null;
  if(snid in loaded){
    return callback(err,loaded[snid]);
  }
  else {
    db.snippets.get(snid,function(err, snippet){
      if(!snippet || snippet.length<1){
        console.log('ERR: SNIPPET NOT FOUND');
        return callback(err,snippet);
      } else {
        loaded[snid] = new Snippet(snippet);
        return callback(err,loaded[snid]);
      }
    });
  }
}

var add = function(details, callback){
  db.snippets.count(function(err, count){
  	var hashids = new Hashids("Twoflower"),
    id = hashids.encode(count,Date.now());
    console.log(id)

    db.snippets.add(id,'',details.user,details.group,function(err, id){
      return callback(err, id);
    });
  });
}

var remove = function(id, callback){
  db.snippets.delete(id,function(err, id){
    return callback(err, id);
  });
}

var save = function(id, callback){
  var s = loaded[id];
  db.snippets.update(id, s.getContent(), function(err, id){
    callback(err, id);
  });
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

exports.save = save;
exports.add = add;
exports.remove = remove;
exports.get = get;
exports.search = search;
exports.listAll = listAll;
