// Required modules.
var mongoose = require("mongoose");

// User Schema
var userSchema = mongoose.Schema({
    displayname: String,
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
var userModel = mongoose.model("User", userSchema);

// Export
module.exports = { 
    statics : require("./statics")(userModel), 
    model : userModel
};