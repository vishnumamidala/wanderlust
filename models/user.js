const mongoose = require("mongoose");

// Fix for passport-local-mongoose in Node.js v25+
const plm = require("passport-local-mongoose").default || require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  }, // ✅ comma was missing here

  stripeAccountId: {
    type: String
  }

});

// Use passport-local-mongoose
UserSchema.plugin(plm);

module.exports = mongoose.model("User", UserSchema);
