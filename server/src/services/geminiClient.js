const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generate = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      const isRetryable =
        err.message?.includes('503') || err.message?.includes('429');

      if (isRetryable && attempt < retries) {
        const waitTime = attempt * 1000; // 1s, then 2s, then 3s
        console.log(`Gemini call failed (attempt ${attempt}), retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      throw err; // not retryable, or out of retries — bubble up the real error
    }
  }
};

module.exports = { generate };