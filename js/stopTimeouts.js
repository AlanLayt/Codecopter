(function() {

    setInterval = (function(oldInterval){
        var test = [];

        var check = function(cb,c,p){
                return test[test.length] = oldInterval(cb,c);
        }

        check.clear = function(){
            test.forEach(function(t){
                clearInterval(t);
            });
        };

        setTimeout(check.clear,3000);

        return check;
    })(window.setInterval);






    setTimeout = (function(oldTimeout){

    })(window.setTimeout);

})();
