const { runEvaluation } = require('./evaluatorUtils');

const evaluateConfidence = async ({ transcriptText }) => {
  const prompt = `You are an expert interview coach evaluating ONLY the candidate's confidence and composure, inferred from the wording of their answers in this mock interview transcript (not tone of voice).

Transcript:
${transcriptText}

Judge decisiveness, hedging language, and how composed their answers read. Ignore technical correctness and problem-solving approach — those are evaluated separately.

Respond with ONLY valid JSON, no markdown:
{
  "score": <0-10>,
  "strengths": ["<point>"],
  "areasToImprove": ["<point>"]
}`;
  return runEvaluation(prompt);
};

module.exports = { evaluateConfidence };