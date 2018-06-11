// Required modules.
var mongoose = require("mongoose");

// Log Schema
var logSchema = mongoose.Schema({
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
module.exports = mongoose.model("Log", logSchema);