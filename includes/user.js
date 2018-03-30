var mongoose = require("mongoose");

var UserSchema = mongoose.Schema({
    displayname: String,
    points: Number,
    items: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Item"
      }
    ]
});

var User = mongoose.model("User", UserSchema);
module.exports = User;