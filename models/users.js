const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const scheduleSchema = Schema({ data: String, lessons: String });

const UserSchema = new Schema({
  username: {
    type: String,
  },
  // schedule: scheduleSchema,
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Users", UserSchema);
