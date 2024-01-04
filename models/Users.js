const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudySession" }],
  /*
  I would still need to include things such as the streaks,
  their friends, their progress, etc.

  I can use "Session" to see how long they studied that day.
  Then I can store it in the history, this history will record
  when they have studied and can be used to make the streaks feature.
  
  But for the session, I would need to create another Schema for it that would
  include how many cycles they had, how many breaks, etc.
  
  */
});

const User = mongoose.model("user", userSchema);

module.exports = User;
