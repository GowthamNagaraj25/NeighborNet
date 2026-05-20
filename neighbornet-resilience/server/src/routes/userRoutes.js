const express = require('express');
const router = express.Router();
const { getProfile, updateMe, getNearbyUsers, getBloodDonors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/blood-donors', protect, getBloodDonors);
router.get('/nearby', protect, getNearbyUsers);
router.get('/profile/:id', protect, getProfile);
router.put('/me', protect, updateMe);

module.exports = router;
