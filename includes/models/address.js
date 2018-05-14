var mongoose = require("mongoose");
var AddressSchema = mongoose.Schema({
    address: String,
    user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
});
var Address = mongoose.model("Address", AddressSchema);
module.exports = Address