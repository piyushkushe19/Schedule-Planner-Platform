const express = require('express');
const router = express.Router();
const { updateProfile, getPublicProfile, getDashboardStats } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/stats', authenticate, getDashboardStats);
router.put('/profile', authenticate, validate(schemas.updateProfile), updateProfile);
router.get('/:username', getPublicProfile);

module.exports = router;
