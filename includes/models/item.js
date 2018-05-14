var mongoose = require("mongoose");

var ItemSchema = mongoose.Schema({
    itemtype: String
});
var Item = mongoose.model("Item", ItemSchema);
module.exports = Item;