const mongoose = require('mongoose');

const resumeChunkSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chunkText: { type: String, required: true },
  section: { type: String, enum: ['skills', 'experience', 'project', 'summary'], required: true },
  embedding: { type: [Number], required: true },
  chunkIndex: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ResumeChunk', resumeChunkSchema);