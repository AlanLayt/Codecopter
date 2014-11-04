var socket = io(window.location.host,{ reconnection : false });
console.debug(window.location.host);


var Preview = function(element){
  this.foo = "bar";
  this.el = document.getElementById(element);

  var get = function(){
    return this.foo;
  }

  var update = function(val){
    this.el.src = "data:text/html;charset=utf-8,"+escape(val);
  }

  this.get = get;
  this.update = update;
}

var ide = function(){
  var preview = new Preview('display');
  console.debug(preview.get());

  var lastUpdate = false;
  ace.require("ace/ext/language_tools");
  var editor = ace.edit("editor");
  editor.session.setMode("ace/mode/html");
  editor.setTheme("ace/theme/monokai");

  editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
  });

  //document.getElementById('display').src = "data:text/html;charset=utf-8,"+escape(editor.getValue());
  preview.update(editor.getValue());

	editor.on("change", function(e){
    var content = editor.getValue();

//    console.debug(lastUpdate);
  //  console.debug(e);
    if( lastUpdate===false
        || (e.data.text != lastUpdate.text
        || e.data.range.start.column != lastUpdate.range.start.column
        || e.data.range.start.row != lastUpdate.range.start.row )){

      var data = e.data;
      data.full = editor.getValue();

      switch(e.data.action){
        case 'insertText':
          socket.emit('insert', data);
          break;
        case 'removeText':
          socket.emit('remove', data);
          break;
      }
  //		console.debug("Pushing update to server");
  //    document.getElementById('display').src = "data:text/html;charset=utf-8,"+escape(editor.getValue());
      preview.update(editor.getValue());
    }
  //  else
  //    console.debug("Duplicate stopped from firing");
	});

  socket.on('insert', function (data) {
    lastUpdate = data;
    // Removed .getDocument() from before insert. May have broken things?
    editor.session.insert(data.range.start,data.text);

//    console.debug("Update recieved from server");
    //document.getElementById('display').src = "data:text/html;charset=utf-8,"+escape(editor.getValue());
    preview.update(editor.getValue());
  });



  socket.on('remove', function (data) {
    lastUpdate = data;
    editor.session.getDocument().remove(data.range);
//    console.debug("removing text");
//    document.getElementById('display').src = "data:text/html;charset=utf-8,"+escape(editor.getValue());
    preview.update(editor.getValue());
  });

	socket.on('disconnect', function () {
		socket.disconnect();
		console.debug("Connection Lost. Reloading.");
	 	location.reload();
	});

}



document.addEventListener("DOMContentLoaded", function(event) {
    socket.on('connectionConfirmed', function (data) {
      document.getElementById("editor").textContent = data.content;
  //    console.debug(data)
      console.debug("Connected");
      ide();
    });
});
