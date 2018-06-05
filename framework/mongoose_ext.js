var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/stinkpoints_v2", function(err) {
   
   if (err) console.log(err);
      console.log("Connected to DB.");
      
});

module.exports = mongoose;