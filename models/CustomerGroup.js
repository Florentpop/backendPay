const mongoose = require("mongoose");

const CustomerGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  members: [{ type: String }], // store phone numbers
});

module.exports = mongoose.model("CustomerGroup", CustomerGroupSchema);
