var it = tester();
var socket = io(window.location.host,{ reconnection : false });

window.addEventListener("DOMContentLoaded", function() {
  console.log("Connecting");
  tester();
  it.next();
}, false);





function *tester(){
  console.log("Test running")
  var result = yield request( "http://127.0.0.1:8888/auth/key" );
}
function request(url) {
  makeAjaxCall( url, function(response){

      socket.on('connect', function () {
        console.log("Socket connection established")
        socket.emit('authKey',{token:JSON.parse(response).token});
      });

      it.next( response );
  });
}








function makeAjaxCall(url,success,failure){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(xhr.responseText);
      } else {
        failure();
        console.log("Connection error.");
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
}
