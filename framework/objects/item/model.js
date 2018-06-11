// Required modules.
var mongoose = require("mongoose");

// Item Schema
var ItemSchema = mongoose.Schema({
    itemtype: String
});

// Item Model
module.exports = mongoose.model("Item", ItemSchema);