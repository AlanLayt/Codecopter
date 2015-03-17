console.debug(window.location.host);
var socket = io(window.location.host,{ reconnection : false });
var cursors = Array();


var Draw = function(element){

}

var Preview = function(element){
  this.el = document.getElementById(element);
  this.content = "";
  this.ut = 0;
  this.tickStep = 100;
  this.updateTimeout = 300;
  this.running = true;

  this.update = function(val){
    this.content = val;
  }
  this.refresh = function(){
    this.el.src = "data:text/html;charset=utf-8,"+escape(this.content);
  }
  this.tick = function(preview,callback){

    //console.log(preview.running)
    if(preview.ut<preview.updateTimeout || !preview.running)
        preview.ut+=preview.tickStep;
    else {
      preview.running = false;
      preview.ut=0;
      callback();
      preview.refresh();
    }
    //console.debug("Tick %ds", preview.ut/1000);
    var ticker = setTimeout(preview.tick,preview.tickStep,preview,callback);

  }

  this.resetTicker = function(){
    this.ut=0;
    this.running = true;
    //console.log("Resetting timer");
  }

  this.tick(this,function(){})
}







var ide = function(snid){
  var preview = new Preview('display');
  var caretBlink = false;


  //preview.tickStart(function(){
  //  console.debug("Refresh");
  //});


  // Ace Initialization
  var lastUpdate = false;
  ace.require("ace/ext/language_tools");
  var editor = ace.edit("editor");
  editor.session.setMode("ace/mode/html");
  editor.setTheme("ace/theme/dreamweaver");

  editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
  });

  preview.update(editor.getValue());







 // Caret stuff

 var blinkProc = function(){
   caretBlink = caretBlink?false:true;
   var blinkTimer = window.setTimeout(blinkProc,800);
   Object.keys(cursors).forEach(function(key){
     cursors[key].el.style.display = caretBlink?'block':'none';
   });
 }
 blinkProc();


  //console.debug(editor.selection);
  editor.selection.on('changeCursor',function(){
    var pos = editor.selection.getCursor();
    pos.snid = snid;
    socket.emit('cursorMove',pos);
    //console.debug(editor.renderer.textToScreenCoordinates(pos.row,pos.column));
    //console.debug(editor.selection.getCursor());//textToScreenCoordinates
  });

  socket.on('cursorMove', function (data) {
    var curhold = document.getElementById("cursorHold");
    curhold.innerHTML = '';
    var pos = editor.renderer.textToScreenCoordinates(data.row,data.column);
    //console.debug("Incoming cursor:");
    //console.debug(editor.renderer.textToScreenCoordinates(data.row,data.column));
    var colours = Array('B8006D','FF774C','3DA7D5');

    if(data.socketid in cursors){
      cursors[data.socketid].row = data.row;
      cursors[data.socketid].column = data.column;
    }
    else {
      cursors[data.socketid] = data;
      cursors[data.socketid].colour = colours[Math.floor(Math.random()*3)];
    }

//  console.debug(cursors)
    Object.keys(cursors).forEach(function(key){
      var pos = editor.renderer.textToScreenCoordinates(cursors[key].row,cursors[key].column);
      var obj = document.createElement('div');
      obj.id = "::img";
      obj.style.cssText = 'position:absolute;top:' + pos.pageY + 'px;left:' + pos.pageX + 'px;width:0px;height:15px;border-left:3px  solid #'+cursors[key].colour+';-moz-box-shadow: 0px 0px 8px  #fff; display:'+(caretBlink?'block':'none')+';';
      cursors[key].el = obj;
      curhold.appendChild(obj);
    });
  });

document.addEventListener("keydown", function(e) {
  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
    e.preventDefault();
    console.debug('Saving.');

    var details = document.getElementById("details");

  //  console.debug(details.desc.value);
    socket.emit('save', { snid : snid, content : editor.getValue()});

  }
}, false);


  // Editor events

	editor.on("change", function(e){
    var content = editor.getValue();

    if( lastUpdate===false
        || (e.data.text != lastUpdate.text
        || e.data.range.start.column != lastUpdate.range.start.column
        || e.data.range.start.row != lastUpdate.range.start.row )){

      var data = e.data;
      data.full = editor.getValue();
      data.snid = snid;

      switch(e.data.action){
        case 'insertText':
          socket.emit('insert', data);
          break;
        case 'removeText':
          socket.emit('remove', data);
          break;
      }
      preview.update(editor.getValue());
      preview.resetTicker();
    }
	});






  // Socket events

  socket.on('insert', function (data) {
    lastUpdate = data;
    // Removed .getDocument() from before insert. May have broken things?
    editor.session.insert(data.range.start,data.text);
    preview.update(editor.getValue());
  });

  socket.on('remove', function (data) {
    lastUpdate = data;
    editor.session.getDocument().remove(data.range);
    preview.update(editor.getValue());
  });

  socket.on('disconnect', function () {
    socket.disconnect();
    console.debug("Connection Lost. Reloading.");
    var test = window.setTimeout(function(){location.reload()},1000);
  });

  socket.on('loadSnip', function (data) {
    // document.getElementById("editor").textContent = data.content;
  //  console.log(data.snippet.content)
    editor.setValue(data.snippet.content);
  });

}



document.addEventListener("DOMContentLoaded", function(event) {
    var snid = document.getElementById('editor').getAttribute('snid');
    socket.on('connectionConfirmed', function (data) {
      socket.emit('requestSnip', {snid : snid});
      console.debug("Connected");
      ide(snid);
    });
});
