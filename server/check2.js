require('dotenv').config();
const mongoose = require('mongoose');
const Transcript = require('./src/models/Transcript');
const { generateScorecard } = require('./src/agents/scoringAgent');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const t = await Transcript.findOne({ _id: '6a7388fa2163ae176473d7ed' });

  const answersWithMetrics = t.messages.filter(
    (m) => m.role === 'candidate' && m.speechMetrics
  );

  let speechSummary = null;
  if (answersWithMetrics.length > 0) {
    speechSummary = 'test speech summary';
  }

  try {
    const result = await generateScorecard({
      targetRole: t.targetRole,
      messages: t.messages,
      speechSummary,
    });
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.log('ERROR MESSAGE:', err.message);
    console.log('FULL STACK:', err.stack);
  }
  process.exit();
});
