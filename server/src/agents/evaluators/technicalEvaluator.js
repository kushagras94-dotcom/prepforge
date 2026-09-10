const { runEvaluation } = require('./evaluatorUtils');

const evaluateTechnical = async ({ targetRole, transcriptText }) => {
  const prompt = `You are an expert technical interviewer evaluating ONLY the technical accuracy and depth of knowledge shown in this mock interview transcript for a ${targetRole} position.

Transcript:
${transcriptText}

Judge correctness of technical claims and depth of understanding. Ignore communication style — that's evaluated separately.

Respond with ONLY valid JSON, no markdown:
{
  "score": <0-10>,
  "strengths": ["<point>"],
  "areasToImprove": ["<point>"]
}`;
  return runEvaluation(prompt);
};

module.exports = { evaluateTechnical };