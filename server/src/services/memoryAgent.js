const { generate } = require('./aiClient');

const MAX_ITEMS = 8;

function mergeUnique(existing = [], incoming = []) {
  const set = new Set(existing);
  for (const item of incoming) set.add(item);
  return Array.from(set).slice(-MAX_ITEMS);
}

const EXTRACTION_PROMPT = (question, answer) => `You are tracking a candidate's mock interview progress. Given the latest question and answer, extract JSON only — no markdown, no extra text:
{
  "topicsDiscussed": ["short topic labels covered in this exchange"],
  "weakAreas": ["topics the candidate struggled with or gave a vague/incomplete answer on, if any"],
  "strongAreas": ["topics the candidate answered confidently and in depth, if any"]
}
Keep each array short (0-2 items). Leave arrays empty if nothing clearly applies.

Question: ${question}
Answer: ${answer}`;

const updateMemory = async ({ existingMemory, question, answer }) => {
  try {
    const raw = await generate(EXTRACTION_PROMPT(question, answer));
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      topicsDiscussed: mergeUnique(existingMemory?.topicsDiscussed, parsed.topicsDiscussed),
      weakAreas: mergeUnique(existingMemory?.weakAreas, parsed.weakAreas),
      strongAreas: mergeUnique(existingMemory?.strongAreas, parsed.strongAreas),
    };
  } catch (err) {
    console.error('Memory extraction failed, keeping existing memory:', err.message);
    return existingMemory || { topicsDiscussed: [], weakAreas: [], strongAreas: [] };
  }
};

module.exports = { updateMemory };