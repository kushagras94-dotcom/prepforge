const { runEvaluation } = require('./evaluatorUtils');

const evaluateProblemSolving = async ({ transcriptText }) => {
  const prompt = `You are an expert interviewer evaluating ONLY the candidate's problem-solving approach in this mock interview transcript.

Transcript:
${transcriptText}

Judge how the candidate breaks down problems, structures their reasoning, and handles edge cases or trade-offs. Ignore raw technical correctness and communication style — those are evaluated separately.

Respond with ONLY valid JSON, no markdown:
{
  "score": <0-10>,
  "strengths": ["<point>"],
  "areasToImprove": ["<point>"]
}`;
  return runEvaluation(prompt);
};

module.exports = { evaluateProblemSolving };