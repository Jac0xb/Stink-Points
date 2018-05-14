var mongoose = require("mongoose");

var ModeratorLogSchema = mongoose.Schema({
    log: String,
    timestamp: {type: Date, default: Date.now},
    target: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
});

var ModeratorLog = mongoose.model("ModeratorLog", ModeratorLogSchema);
module.exports = ModeratorLog;