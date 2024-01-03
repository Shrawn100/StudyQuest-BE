const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  duration: {
    type: Number,
    required: true,
  },
});

const StudySession = mongoose.model("studySession", studySessionSchema);

module.exports = StudySession;
