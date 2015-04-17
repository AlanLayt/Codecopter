var snid;
var app = angular.module('CodeLight', []);

window.addEventListener("DOMContentLoaded", function() {
  var el = document.getElementById('editor');
  if(el!==null)
    snid = el.getAttribute('snid');


  var search = document.getElementById('Search');
  if(search!==null){
    var es = document.getElementsByClassName("searchCodeDisplay");
    //  console.log(es[0])
    for(var i=0;i<es.length;i++){
      console.log(es[i]);
      var editor = ace.edit(es[i]);
      editor.setTheme("ace/theme/monokai");
      editor.renderer.setShowGutter(false);
      editor.getSession().setMode("ace/mode/javascript");
    };
  }

}, false);


var Preview = function(element){
  this.el = document.getElementById(element);
  this.content = "";
  this.ut = 0;
  this.tickStep = 100;
  this.updateTimeout = 300;
  this.running = true;
  this.liveView = false;

  this.update = function(val,snid){
    this.content = val;
    return this;
  }
  this.refresh = function(){
    var src = this.liveView?'http://'+window.location.hostname+':' + window.location.port + '/s/' + snid:"data:text/html;charset=utf-8,"+escape(this.content);
    this.el.src = src;
  }
  this.tick = function(preview,callback){
    if(preview.ut<preview.updateTimeout || !preview.running)
        preview.ut+=preview.tickStep;
    else {
      preview.running = false;
      preview.ut=0;
      callback();
      preview.refresh();
    }
    var ticker = setTimeout(preview.tick,preview.tickStep,preview,callback);
  }

  this.resetTicker = function(){
    this.ut=0;
    this.running = true;
  }

  this.tick(this,function(){});
}
