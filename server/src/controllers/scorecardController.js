const Scorecard = require('../models/Scorecard');
const Transcript = require('../models/Transcript');
const { generateScorecard } = require('../orchestrator/interviewOrchestrator');

// GET /api/scorecard/:transcriptId
exports.getScorecard = async (req, res) => {
  try {
    const scorecard = await Scorecard.findOne({
      transcript: req.params.transcriptId,
      user: req.userId,
    });

    if (!scorecard) {
      return res.status(404).json({ message: 'Scorecard not found' });
    }

    res.status(200).json(scorecard);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scorecard', error: err.message });
  }
};