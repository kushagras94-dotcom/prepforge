const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const generate = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
module.exports = { generate };
