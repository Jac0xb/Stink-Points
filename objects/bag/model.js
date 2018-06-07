// Required modules.
var mongoose = require("mongoose");

// Bag Schema
var bagSchema = mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }
});

// Bag Model
module.exports = mongoose.model("Bag", bagSchema);