const { generate } = require('../../services/aiClient');

const runEvaluation = async (prompt) => {
  let text = await generate(prompt);
  text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(text);
};

module.exports = { runEvaluation };