const { generate } = require('../services/geminiClient');

const generateScorecard = async ({ targetRole, messages }) => {
  const transcriptText = messages
    .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');

  const prompt = `You are an expert technical interviewer evaluating a mock interview transcript for a ${targetRole} position.

Transcript:
${transcriptText}

Evaluate the candidate on these four dimensions, each scored 0-10:
- communication: clarity, structure, and articulation of answers
- technicalAccuracy: correctness and depth of technical knowledge shown
- problemSolving: approach to breaking down and solving problems
- confidence: decisiveness and composure in answers (inferred from wording, not tone of voice)

Respond with ONLY valid JSON in exactly this format, no markdown, no extra text:
{
  "scores": {
    "communication": <number>,
    "technicalAccuracy": <number>,
    "problemSolving": <number>,
    "confidence": <number>
  },
  "overallFeedback": "<2-3 sentence summary>",
  "strengths": ["<point1>", "<point2>"],
  "areasToImprove": ["<point1>", "<point2>"]
}`;

  let text = await generate(prompt);
  text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(text);
};

module.exports = { generateScorecard };