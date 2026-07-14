const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
const Resume = require('../models/Resume');
const { generate } = require('../services/aiClient');

const EXTRACTION_PROMPT = (resumeText) => `You are analyzing a candidate's resume. Extract the following as JSON only — no markdown, no code fences, no extra text:
{
  "skills": ["skill1", "skill2"],
  "experience": ["short bullet describing each role/internship"],
  "projects": ["short bullet describing each project"],
  "summary": "2-3 sentence overview of the candidate's background"
}

Resume text:
"""
${resumeText}
"""`;

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text.slice(0, 8000);

    const aiResponse = await generate(EXTRACTION_PROMPT(resumeText));
    let structured;
    try {
      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      structured = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(502).json({ message: 'Failed to parse resume analysis', raw: aiResponse });
    }

    const resume = await Resume.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        fileName: req.file.originalname,
        skills: structured.skills || [],
        experience: structured.experience || [],
        projects: structured.projects || [],
        summary: structured.summary || '',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ resume });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process resume', error: err.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.status(200).json({ resume });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume', error: err.message });
  }
};