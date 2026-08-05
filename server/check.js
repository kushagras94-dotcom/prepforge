require('dotenv').config();
const mongoose = require('mongoose');
const Transcript = require('./src/models/Transcript');
const Scorecard = require('./src/models/Scorecard');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const t = await Transcript.findOne({ status: 'completed' }).sort({ createdAt: -1 });
  if (t === null) {
    console.log('no completed transcripts found');
    process.exit();
  }
  console.log('transcript id:', t._id.toString());
  const sc = await Scorecard.findOne({ transcript: t._id });
  console.log('scorecard exists:', sc !== null);
  process.exit();
});
