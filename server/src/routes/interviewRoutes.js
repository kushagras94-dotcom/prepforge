const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/audioUpload');
const {
  startInterview,
  submitAnswer,
  submitVoiceAnswer,
  endInterview,
  getHistory,
} = require('../controllers/interviewController');

router.post('/start', protect, rateLimiter, startInterview);
router.get('/history', protect, getHistory);
router.post('/:id/answer', protect, rateLimiter, submitAnswer);
router.post('/:id/end', protect, rateLimiter, endInterview);
router.post('/:id/answer-voice', protect, rateLimiter, upload.single('audio'), submitVoiceAnswer);

module.exports = router;
