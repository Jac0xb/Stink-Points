// Required modules.
var mongoose = require("mongoose");

// Item Schema
var ItemSchema = mongoose.Schema({
    itemtype: String
});

// Item Model
var ItemModel = mongoose.model("Item", ItemSchema);

// Export 
module.exports = { 
    statics : undefined, 
    model : ItemModel
};