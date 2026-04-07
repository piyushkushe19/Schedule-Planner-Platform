const express = require('express');
const router = express.Router();
const {
  getMyAvailability,
  updateAvailability,
  getPublicAvailability,
} = require('../controllers/availabilityController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/me', authenticate, getMyAvailability);
router.put('/me', authenticate, validate(schemas.availability), updateAvailability);
router.get('/public/:username', getPublicAvailability);

module.exports = router;
