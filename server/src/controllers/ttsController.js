const axios = require('axios');

const DEFAULT_SPEAKER = 'shubh';

exports.synthesize = async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const speaker = voice || DEFAULT_SPEAKER;

    const response = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        text,
        target_language_code: 'en-IN',
        speaker,
        model: 'bulbul:v3',
        pace: 1.0,
      },
      {
        headers: {
          'api-subscription-key': process.env.SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const audioBase64 = response.data.audios[0];
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err) {
    console.error('TTS error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to synthesize speech' });
  }
};