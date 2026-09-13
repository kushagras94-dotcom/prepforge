console.log('>>> ttsRoutes.js loaded');
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { synthesize } = require('../controllers/ttsController');

router.post('/speak', protect, synthesize);

module.exports = router;