// Required modules.
var mongoose = require("mongoose");

// Bag Schema
var BagSchema = mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }
});

// Bag Model
var BagModel = mongoose.model("Bag", BagSchema);

// Export 
module.exports = { 
    statics : undefined, 
    model : BagModel
};