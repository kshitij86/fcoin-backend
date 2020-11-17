const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  user_name: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
  pull_requests: {
    type: Number,
    default: 0,
  },
  last_checked: {
    type: Date,
    default: Date.now(),
  },
  fcoins: {
    type: Number,
    default: 0,
  },
});

module.exports = model("User", userSchema);
