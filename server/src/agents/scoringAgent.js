const { generate } = require('../services/aiClient');
const { evaluateCommunication } = require('./evaluators/communicationEvaluator');
const { evaluateTechnical } = require('./evaluators/technicalEvaluator');
const { evaluateProblemSolving } = require('./evaluators/problemSolvingEvaluator');
const { evaluateConfidence } = require('./evaluators/confidenceEvaluator');

function mergeUnique(arrays, max = 5) {
  const set = new Set();
  for (const arr of arrays) for (const item of arr) set.add(item);
  return Array.from(set).slice(0, max);
}

const generateScorecard = async ({ targetRole, messages, speechSummary }) => {
  const transcriptText = messages
    .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');

  const speechContext = speechSummary
    ? `\n\nSpeech delivery data (measured from voice recordings): ${speechSummary}\nFactor this into the communication score where relevant.`
    : '';

  const [communication, technical, problemSolving, confidence] = await Promise.all([
    evaluateCommunication({ transcriptText, speechContext }),
    evaluateTechnical({ targetRole, transcriptText }),
    evaluateProblemSolving({ transcriptText }),
    evaluateConfidence({ transcriptText }),
  ]);

  const scores = {
    communication: communication.score,
    technicalAccuracy: technical.score,
    problemSolving: problemSolving.score,
    confidence: confidence.score,
  };

  const strengths = mergeUnique([
    communication.strengths,
    technical.strengths,
    problemSolving.strengths,
    confidence.strengths,
  ]);

  const areasToImprove = mergeUnique([
    communication.areasToImprove,
    technical.areasToImprove,
    problemSolving.areasToImprove,
    confidence.areasToImprove,
  ]);

  const synthesisPrompt = `You are aggregating four specialist evaluations of a mock interview for a ${targetRole} position into one final summary.

Scores: communication ${scores.communication}/10, technicalAccuracy ${scores.technicalAccuracy}/10, problemSolving ${scores.problemSolving}/10, confidence ${scores.confidence}/10.
Strengths noted: ${strengths.join('; ')}
Areas to improve noted: ${areasToImprove.join('; ')}

Write a 2-3 sentence overall feedback summary synthesizing these into one coherent assessment. Respond with ONLY the summary text, no labels, no JSON.`;

  const overallFeedback = (await generate(synthesisPrompt)).trim();

  return { scores, overallFeedback, strengths, areasToImprove };
};

module.exports = { generateScorecard };