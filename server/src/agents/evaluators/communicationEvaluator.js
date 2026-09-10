const { runEvaluation } = require('./evaluatorUtils');

const evaluateCommunication = async ({ transcriptText, speechContext }) => {
  const prompt = `You are an expert interview coach evaluating ONLY the candidate's communication skills from this mock interview transcript.

Transcript:
${transcriptText}${speechContext || ''}

Judge clarity, structure, and articulation of answers. Ignore technical correctness — that's evaluated separately.

Respond with ONLY valid JSON, no markdown:
{
  "score": <0-10>,
  "strengths": ["<point>"],
  "areasToImprove": ["<point>"]
}`;
  return runEvaluation(prompt);
};

module.exports = { evaluateCommunication };