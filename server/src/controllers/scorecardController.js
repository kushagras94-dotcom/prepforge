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
// GET /api/scorecard/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const scorecards = await Scorecard.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .select('scores createdAt');

    if (scorecards.length === 0) {
      return res.status(200).json({ trend: [], averages: null, count: 0 });
    }

    const trend = scorecards.map((sc, i) => ({
      interview: i + 1,
      communication: sc.scores.communication,
      technicalAccuracy: sc.scores.technicalAccuracy,
      problemSolving: sc.scores.problemSolving,
      confidence: sc.scores.confidence,
    }));

    const n = scorecards.length;
    const sum = { communication: 0, technicalAccuracy: 0, problemSolving: 0, confidence: 0 };
    scorecards.forEach((sc) => {
      sum.communication += sc.scores.communication;
      sum.technicalAccuracy += sc.scores.technicalAccuracy;
      sum.problemSolving += sc.scores.problemSolving;
      sum.confidence += sc.scores.confidence;
    });
    const averages = {
      communication: Math.round((sum.communication / n) * 10) / 10,
      technicalAccuracy: Math.round((sum.technicalAccuracy / n) * 10) / 10,
      problemSolving: Math.round((sum.problemSolving / n) * 10) / 10,
      confidence: Math.round((sum.confidence / n) * 10) / 10,
    };

    res.status(200).json({ trend, averages, count: n });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
};