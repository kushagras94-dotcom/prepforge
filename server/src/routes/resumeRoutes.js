const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const { uploadResume, getResume } = require('../controllers/resumeController');

router.post('/upload', protect, rateLimiter, upload.single('resume'), uploadResume);
router.get('/me', protect, getResume);

module.exports = router;