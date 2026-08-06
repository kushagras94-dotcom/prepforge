const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getScorecard, getAnalytics  } = require('../controllers/scorecardController');


router.get('/analytics', protect, getAnalytics);
router.get('/:transcriptId', protect, getScorecard);

module.exports = router;