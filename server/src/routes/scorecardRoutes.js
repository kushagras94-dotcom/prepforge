const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getScorecard } = require('../controllers/scorecardController');

router.get('/:transcriptId', protect, getScorecard);

module.exports = router;