const Transcript = require('../models/Transcript');
const Scorecard = require('../models/Scorecard');
const { getNextQuestion, generateScorecard } = require('../orchestrator/interviewOrchestrator');
// POST /api/interview/start
exports.startInterview = async (req, res) => {
  try {
    const { targetRole, targetCompany, difficulty } = req.body;
    const userId = req.userId;

    const transcript = await Transcript.create({
      user: userId,
      targetRole: targetRole || 'Software Engineer',
      targetCompany: targetCompany || null,
      difficulty: difficulty || 'Medium',
      messages: [],
    });

    const question = await getNextQuestion({
      targetRole: transcript.targetRole,
      targetCompany: transcript.targetCompany,
      difficulty: transcript.difficulty,
      messages: [],
    });

    transcript.messages.push({ role: 'interviewer', content: question });
    await transcript.save();

    res.status(201).json({
      transcriptId: transcript._id,
      question,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start interview', error: err.message });
  }
};

// POST /api/interview/:id/answer
exports.submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const { id } = req.params;

    if (!answer) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const transcript = await Transcript.findOne({ _id: id, user: req.userId });
    if (!transcript) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    transcript.messages.push({ role: 'candidate', content: answer });

    const nextQuestion = await getNextQuestion({
      targetRole: transcript.targetRole,
      targetCompany: transcript.targetCompany,
      difficulty: transcript.difficulty,
      messages: transcript.messages,
    });

    transcript.messages.push({ role: 'interviewer', content: nextQuestion });
    await transcript.save();

    res.status(200).json({
      question: nextQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process answer', error: err.message });
  }
};


// POST /api/interview/:id/end
exports.endInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const transcript = await Transcript.findOne({ _id: id, user: req.userId });
    if (!transcript) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    transcript.status = 'completed';
    await transcript.save();

    const scoreData = await generateScorecard({
      targetRole: transcript.targetRole,
      messages: transcript.messages,
    });

    const scorecard = await Scorecard.create({
      user: req.userId,
      transcript: transcript._id,
      scores: scoreData.scores,
      overallFeedback: scoreData.overallFeedback,
      strengths: scoreData.strengths,
      areasToImprove: scoreData.areasToImprove,
    });

    res.status(200).json({ message: 'Interview completed', scorecard });
  } catch (err) {
    res.status(500).json({ message: 'Failed to end interview', error: err.message });
  }
};