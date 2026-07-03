const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  startInterview,
  submitAnswer,
  endInterview,
} = require('../controllers/interviewController');

router.post('/start', protect, startInterview);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/end', protect, endInterview);

module.exports = router;