const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generate = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content.trim();
    } catch (err) {
      if (attempt < retries) {
        const waitTime = attempt * 1000;
        console.log(`Groq call failed (attempt ${attempt}), retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
};

module.exports = { generate };