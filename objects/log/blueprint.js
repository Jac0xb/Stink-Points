// Required modules.
var mongoose = require("mongoose");

// Log Schema
var LogSchema = mongoose.Schema({
    log: String,
    timestamp: {type: Date, default: Date.now},
    admin: Boolean,
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

// Log Model
var LogModel = mongoose.model("Log", LogSchema);

// Export
module.exports = { 
    statics : require("./statics")(LogModel), 
    model : LogModel
};