const { transcribe } = require('../services/aiClient');
const { computeSpeechMetrics } = require('../utils/speechMetrics');
const Transcript = require('../models/Transcript');
const Scorecard = require('../models/Scorecard');
const { getNextQuestion, generateScorecard } = require('../orchestrator/interviewOrchestrator');
const Resume = require('../models/Resume');
const axios = require('axios');
const { updateMemory } = require('../services/memoryAgent');
const { adjustDifficulty } = require('../utils/adaptiveDifficulty');
// POST /api/interview/start
exports.startInterview = async (req, res) => {
  try {
    const { targetRole, targetCompany, difficulty, useResume } = req.body;
    const userId = req.userId;
    let resumeContext = null;
    let resume = null;
    if (useResume) {
      resume = await Resume.findOne({ user: userId });
      if (resume) {
        try {
          const { data } = await axios.post('http://localhost:8000/retrieve', {
            resumeId: resume._id.toString(),
            query: `${targetCompany || ''} ${targetRole || ''} interview question context`.trim(),
            k: 3,
          });
          resumeContext = data.context;
        } catch (ragErr) {
          console.error('RAG retrieval failed, falling back to full resume text:', ragErr.message);
          resumeContext = `Skills: ${resume.skills.join(', ')}. Experience: ${resume.experience.join('; ')}. Projects: ${resume.projects.join('; ')}.`;
        }
      }
    }

    const transcript = await Transcript.create({
      user: userId,
      targetRole: targetRole || 'Software Engineer',
      targetCompany: targetCompany || null,
      difficulty: difficulty || 'Medium',
      resumeContext,
      messages: [],
    });

    let question;
    if (resume) {
      try {
        const { data } = await axios.post('http://localhost:8000/agent/start-question', {
          role: transcript.targetRole,
          company: transcript.targetCompany || '',
          difficulty: transcript.difficulty,
          resumeId: resume._id.toString(),
          userId: userId.toString(),
        });
        question = data.question;
      } catch (agentErr) {
        console.error('Agent opening question failed, falling back to questionAgent:', agentErr.message);
        question = await getNextQuestion({
          targetRole: transcript.targetRole,
          targetCompany: transcript.targetCompany,
          difficulty: transcript.difficulty,
          resumeContext: transcript.resumeContext,
          messages: [],
        });
      }
    } else {
      question = await getNextQuestion({
        targetRole: transcript.targetRole,
        targetCompany: transcript.targetCompany,
        difficulty: transcript.difficulty,
        resumeContext: transcript.resumeContext,
        messages: [],
      });
    }

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


    const lastQuestion = transcript.messages[transcript.messages.length - 2]?.content || '';
    const memoryResult = await updateMemory({
      existingMemory: transcript.memory,
      question: lastQuestion,
      answer,
    });
    transcript.memory = memoryResult.memory;
    adjustDifficulty(transcript, memoryResult.performance);

    const nextQuestion = await getNextQuestion({
      targetRole: transcript.targetRole,
      targetCompany: transcript.targetCompany,
      difficulty: transcript.difficulty,
      resumeContext: transcript.resumeContext,
      memory: transcript.memory,
      messages: transcript.messages.slice(-6),
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

    const answersWithMetrics = transcript.messages.filter(
      (m) => m.role === 'candidate' && m.speechMetrics
    );

    let communicationMetrics = null;
    let speechSummary = null;

    if (answersWithMetrics.length > 0) {
      const n = answersWithMetrics.length;
      const avgWpm = Math.round(
        answersWithMetrics.reduce((sum, m) => sum + m.speechMetrics.wpm, 0) / n
      );
      const totalFillerWords = answersWithMetrics.reduce(
        (sum, m) => sum + m.speechMetrics.fillerWordCount,
        0
      );
      const avgFillerWordsPerAnswer = Math.round((totalFillerWords / n) * 10) / 10;
      const totalPauses = answersWithMetrics.reduce(
        (sum, m) => sum + m.speechMetrics.pauseCount,
        0
      );
      const avgPauseSeconds =
        Math.round(
          (answersWithMetrics.reduce((sum, m) => sum + m.speechMetrics.totalPauseSeconds, 0) / n) * 10
        ) / 10;

      communicationMetrics = {
        avgWpm,
        totalFillerWords,
        avgFillerWordsPerAnswer,
        totalPauses,
        avgPauseSeconds,
      };
      speechSummary = `Average speaking pace ${avgWpm} WPM, ${avgFillerWordsPerAnswer} filler words per answer on average, ${totalPauses} long pauses (>1.2s) across the interview.`;
    }

    const scoreData = await generateScorecard({
      targetRole: transcript.targetRole,
      messages: transcript.messages,
      speechSummary,
    });

    const scorecard = await Scorecard.create({
      user: req.userId,
      transcript: transcript._id,
      scores: scoreData.scores,
      overallFeedback: scoreData.overallFeedback,
      strengths: scoreData.strengths,
      areasToImprove: scoreData.areasToImprove,
      communicationMetrics,
    });

    res.status(200).json({ message: 'Interview completed', scorecard });
  } catch (err) {
    res.status(500).json({ message: 'Failed to end interview', error: err.message });
  }
};
// GET /api/interview/history
exports.getHistory = async (req, res) => {
  try {
    const transcripts = await Transcript.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('targetRole targetCompany difficulty status createdAt');

    res.status(200).json({ transcripts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
};
// POST /api/interview/:id/answer-voice
exports.submitVoiceAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const transcript = await Transcript.findOne({ _id: id, user: req.userId });
    if (!transcript) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const result = await transcribe(req.file.buffer, req.file.originalname);
    const answerText = (result.text || '').trim();
    const words = result.words || [];
    const speechMetrics = computeSpeechMetrics(words);

    if (!answerText) {
      return res.status(400).json({ message: 'Could not detect any speech in the recording' });
    }

    transcript.messages.push({ role: 'candidate', content: answerText, speechMetrics });
    
    const lastQuestion = transcript.messages[transcript.messages.length - 2]?.content || '';
    const memoryResult = await updateMemory({
      existingMemory: transcript.memory,
      question: lastQuestion,
      answer: answerText,
    });
    transcript.memory = memoryResult.memory;
    adjustDifficulty(transcript, memoryResult.performance);

    const nextQuestion = await getNextQuestion({
      targetRole: transcript.targetRole,
      targetCompany: transcript.targetCompany,
      difficulty: transcript.difficulty,
      resumeContext: transcript.resumeContext,
      memory: transcript.memory,
      messages: transcript.messages.slice(-6),
    });

    transcript.messages.push({ role: 'interviewer', content: nextQuestion });
    await transcript.save();

    res.status(200).json({
      question: nextQuestion,
      transcribedText: answerText,
      speechMetrics,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process voice answer', error: err.message });
  }
};