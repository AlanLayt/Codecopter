
  var socket = io('127.0.0.1',{ reconnection : false });

	var ide = function(){

/*
tttt = function(tb,pos) {
        var $inputor, at_rect, end_range, format, html, mirror, start_range;
        $inputor = tb;
var t = document.createElement('div');
        console.debug(document.createElement('div'));
        format = function(value) {
        	var tem = document.createElement('div')
        	tem.innerText = value;
        	console.debug(tem.innerHtml)
        	tem = tem.innerHTML;
          return tem.replace(/\r\n|\r|\n/g, "<br/>").replace(/\s/g, "&nbsp;");
        };
        if (pos === void 0) {
          pos = this.getPos();
        }
        start_range = $inputor.value.slice(0, pos);
        end_range = $inputor.value.slice(pos);
        html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>";
        html += "<span id='caret' style='position: relative; display: inline;'>|</span>";
        html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>";
       // mirror = new Mirror($inputor);
       // return at_rect = mirror.create(html).rect();
       var xmlString = "<div id='holder' style='display:block; visibility:hidden; position:absolute; top:0;left:-1000px; width:500px;'>" + html + "</div>"
  , parser = new DOMParser()
  , doc = parser.parseFromString(xmlString, "text/xml");

       console.debug(html);
       console.debug(doc);
//       document.body.innerHTML+=xmlString;
if(document.getElementById("holder")){
var element = document.getElementById("holder");
element.parentNode.removeChild(element);
}


       document.body.insertBefore(doc.getElementById("holder"),null);
  		console.debug(document.getElementById('caret').getBoundingClientRect());
      };


*/

		var tb = document.getElementById('in');


		tb.addEventListener("keyup", function(e){
			socket.emit('contentModified', { inf : tb.value });
			console.debug(tb.selectionStart);
			//console.debug(tttt(tb,3))
		});

		socket.on('contentUpdate', function (data) {
			tb.value=data.inf;
		});
 
		socket.on('disconnect', function () {
			socket.disconnect(); 
			console.debug("Connection Lost. Reloading.");
		 	location.reload();
		});

		var testfunc = function(){ 
			console.debug("Change");
		};

		tb.onChange = testfunc;

	}



  document.addEventListener("DOMContentLoaded", function(event) {
	  ide();
	});
