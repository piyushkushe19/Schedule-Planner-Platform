const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/slots/:username', getAvailableSlots);
router.post('/book/:username', validate(schemas.booking), createBooking);
router.get('/mine', authenticate, getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
