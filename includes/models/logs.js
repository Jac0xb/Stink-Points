var mongoose = require("mongoose");

var LogSchema = mongoose.Schema({
    log: String,
    timestamp: {type: Date, default: Date.now},
    source: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
    target: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
});

var Log = mongoose.model("Log", LogSchema);
module.exports = Log;