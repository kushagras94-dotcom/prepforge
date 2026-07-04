const mongoose = require('mongoose');

const scorecardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transcript: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transcript',
      required: true,
      unique: true,
    },
    scores: {
      communication: { type: Number, min: 0, max: 10, required: true },
      technicalAccuracy: { type: Number, min: 0, max: 10, required: true },
      problemSolving: { type: Number, min: 0, max: 10, required: true },
      confidence: { type: Number, min: 0, max: 10, required: true },
    },
    overallFeedback: {
      type: String,
      required: true,
    },
    strengths: [String],
    areasToImprove: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scorecard', scorecardSchema);