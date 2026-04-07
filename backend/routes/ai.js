const express = require('express');
const router = express.Router();
const {
  generateMeetingDescription,
  suggestBestTimes,
} = require('../controllers/aiController');

router.post('/generate-description', generateMeetingDescription);
router.post('/suggest-times', suggestBestTimes);

module.exports = router;
