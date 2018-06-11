// Required modules.
var mongoose = require("mongoose");

// User Schema
var userSchema = mongoose.Schema({
    username: String,
    points: Number,
    ammo: {type: Number, default: 5},
    items: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Item"
      }
    ]
});

// User Model
module.exports = mongoose.model("User", userSchema);