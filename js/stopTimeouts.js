(function() {

    setInterval = (function(oldInterval){
        var test = [];

        var check = function(cb,c,p){
            //console.debug(typeof(p)=='undefined');
            if(typeof(p)=='undefined'){
                return test[test.length] = oldInterval(cb,c);
            }
            else{
           //     return oldTimeout(cb,10);
            }

            console.debug('::'+test);
        }

        check.clear = function(){
            test.forEach(function(t){
                console.debug(t);
                clearInterval(t);
            });
        };

        setTimeout(check.clear,3000);

        return check;
    })(window.setInterval);






    setTimeout = (function(oldTimeout){

    })(window.setTimeout);

})();
