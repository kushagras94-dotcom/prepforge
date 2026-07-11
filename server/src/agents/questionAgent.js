const { generate } = require('../services/aiClient');
// TEMPORARY: set to true to skip real Gemini calls while testing rate limiter
const MOCK_MODE = false;

const SYSTEM_INSTRUCTION = (targetRole, targetCompany) => `You are an experienced technical interviewer conducting a mock interview for a ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.
${targetCompany ? `Tailor your questions to reflect ${targetCompany}'s known interview style, focus areas, and difficulty level as closely as possible.\n` : ''}Ask one focused question at a time, based on the candidate's previous answers — dig deeper, ask for clarification, or move to a related topic naturally, like a real interviewer would.
Keep questions concise (1-3 sentences). Do not repeat earlier questions. Do not give feedback or evaluation during the interview — only ask questions.
Respond with ONLY the next question, nothing else — no labels, no extra text.`;

const getNextQuestion = async ({ targetRole, targetCompany, messages }) => {
  if (MOCK_MODE) {
    return `Mock question #${messages.length + 1} for ${targetRole}`;
  }
  const instruction = SYSTEM_INSTRUCTION(targetRole, targetCompany);
  if (messages.length === 0) {
    return generate(`${instruction}\n\nThis is the start of the interview. Ask your opening question.`);
  }
  const transcriptText = messages
    .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');
  return generate(`${instruction}\n\nConversation so far:\n${transcriptText}\n\nBased on the candidate's last answer, ask your next question.`);
};

module.exports = { getNextQuestion };