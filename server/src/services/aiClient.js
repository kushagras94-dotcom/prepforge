const Groq = require('groq-sdk');
const fs = require('fs');
const os = require('os');
const path = require('path');
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
const transcribe = async (audioBuffer, originalFilename = 'audio.webm') => {
  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${originalFilename}`);
  fs.writeFileSync(tempPath, audioBuffer);
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });
    return transcription;
  } finally {
    fs.unlinkSync(tempPath);
  }
};
module.exports = { generate, transcribe };