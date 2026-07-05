const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const {
  startInterview,
  submitAnswer,
  endInterview,
} = require('../controllers/interviewController');

router.post('/start', protect, rateLimiter, startInterview);
router.post('/:id/answer', protect, rateLimiter, submitAnswer);
router.post('/:id/end', protect, rateLimiter, endInterview);

module.exports = router;
