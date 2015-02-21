var expect = require("chai").expect;
var db = require('../database');
var connection = {
  address : 'codelight.ysera',
  dbPort : 27017,
  httpPort : 20559,
  database : 'codeucation'
}


describe('Database', function () {
  describe('Connect', function () {
    it('Should connect to the database successfully', function (done) {
      var connected = false;
      db.connect(connection,
        function(db,connection){
          // Success
          connected = true;
          expect(connected).to.equal(true);
          done();
        },
        function(err,connection){
          // Failure
          console.log(err);
        }
      );
    });
    it('Should fail to connect gracefully', function (done) {
      var connected = false;
      var failConnection = connection;
      db.connect(failConnection.dbPort = -1,
        function(db,connection){
          // Success
        },
        function(err,connection){
          // Failure
          connected = false;
          expect(connected).to.equal(false);
          done();
        }
      );
    });
  });


  describe('Add Snippet', function () {
    it('Should connect to the database successfully', function (done) {
      var connected = false;
      db.connect(connection,
        function(db,connection){
          // Success
          connected = true;
          expect(connected).to.equal(true);
          done();
        },
        function(err,connection){
          // Failure
          console.log(err);
        }
      );
    });
  });
});
