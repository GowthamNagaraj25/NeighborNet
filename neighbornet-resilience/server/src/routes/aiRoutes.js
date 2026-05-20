const express = require('express');
const router = express.Router();
const { getMatches, getTrends, generatePlan, getLogisticsPlan, getCommunityPulse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/matches/:postId', protect, getMatches);
router.get('/trends', protect, getTrends);
router.post('/action-plan', protect, generatePlan);
router.get('/logistics-plan', protect, getLogisticsPlan);
router.get('/community-pulse', protect, getCommunityPulse);

module.exports = router;
