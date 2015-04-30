app.controller('ide', ['$scope', '$http', 'socket', 'editor', function($scope,$http,socket,editor) {
  console.log('Development environment online.');
  var cursors = Array();
  var lastUpdate;
  var loaded = false,
  snid = document.getElementById('editor').getAttribute('snid');
  //console.debug(socket);
  var preview = new Preview('display');
      preview.update(editor.getValue());

  socket.on('IDE:Insert', function (data) {
    lastUpdate = data;
    console.log('insert')
    // Removed .getDocument() from before insert. May have broken things?
    editor.session.insert(data.range.start,data.text);
    prev();
  });
  socket.on('IDE:InsertLines', function (data) {
    lastUpdate = data;
    editor.session.insertLines(data.range.start.row,data.lines);
    prev();
  });
  socket.on('IDE:Remove', function (data) {
    lastUpdate = data;
    editor.session.remove(data.range);
    prev();
  });
  socket.on('IDE:LoadSnip', function (data) {
    console.debug('Loaded snippet.')
    loaded = true;
  });
  

  editor.on("change", function(e){
    var content = editor.getValue();

    if( lastUpdate !== 'undefined' || lastUpdate===false
        || (e.data.text != lastUpdate.text
        || e.data.range.start.column != lastUpdate.range.start.column
        || e.data.range.start.row != lastUpdate.range.start.row )){

      var data = e.data;
      data.full = editor.getValue();
      data.snid = snid;

      console.log(e);
      switch(e.data.action){
        case 'insertText':
          socket.emit('IDE:Insert', data);
          break;
        case 'insertLines':
          socket.emit('IDE:InsertLines', data);
          break;
        case 'removeText':
          socket.emit('IDE:Remove', data);
          break;
        case 'removeLines':
          socket.emit('IDE:Remove', data);
          break;
      }
      prev();
      console.debug(snid);
    }
  });

  var prev = function(){
    preview.update(editor.getValue(),snid).resetTicker();
  }


  document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
      e.preventDefault();
      console.debug('Saving.');
      socket.emit('IDE:Save', { snid : snid, content : editor.getValue()});
    }
  }, false);

}]);
