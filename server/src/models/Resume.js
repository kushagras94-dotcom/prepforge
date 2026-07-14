const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fileName: String,
    skills: [String],
    experience: [String],
    projects: [String],
    summary: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);