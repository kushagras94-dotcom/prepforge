const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const buildPrompt = (targetRole, messages) => {
  const systemInstruction = `You are an experienced technical interviewer conducting a mock interview for a ${targetRole} position.
Ask one focused question at a time, based on the candidate's previous answers — dig deeper, ask for clarification, or move to a related topic naturally, like a real interviewer would.
Keep questions concise (1-3 sentences). Do not repeat earlier questions. Do not give feedback or evaluation during the interview — only ask questions.
Respond with ONLY the next question, nothing else — no labels, no extra text.`;

  if (messages.length === 0) {
    return `${systemInstruction}\n\nThis is the start of the interview. Ask your opening question.`;
  }

  const transcriptText = messages
    .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');

  return `${systemInstruction}\n\nConversation so far:\n${transcriptText}\n\nBased on the candidate's last answer, ask your next question.`;
};

const getNextQuestion = async ({ targetRole, messages }) => {
  const prompt = buildPrompt(targetRole, messages);
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { getNextQuestion };
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

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Gemini sometimes wraps JSON in markdown code fences — strip them if present
  text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

  return JSON.parse(text);
};

module.exports = { getNextQuestion, generateScorecard };