const express = require('express');
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  disconnect,
  getUpcomingEvents,
} = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');

router.get('/auth-url', authenticate, getAuthUrl);
router.get('/callback', authenticate, handleCallback);
router.delete('/disconnect', authenticate, disconnect);
router.get('/events', authenticate, getUpcomingEvents);

module.exports = router;
