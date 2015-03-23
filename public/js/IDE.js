


  /*
var ide = function(snid){

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



}
*/
