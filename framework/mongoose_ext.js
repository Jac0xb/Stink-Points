var mongoose = require("mongoose");
//mongoose.Promise = require("bluebird");
//assert.equal(query.exec().constructor, require('bluebird'));

mongoose.connect("mongodb://localhost/stinkpoints_v3", function(err) {
   
   if (err) {
      console.log(err);
   }
   
   console.log("Connected to DB.");
      
});

module.exports = mongoose;