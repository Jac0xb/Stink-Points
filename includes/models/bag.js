var mongoose = require("mongoose");

var BagSchema = mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }

});
var Item = mongoose.model("Bag", BagSchema);
module.exports = Item;