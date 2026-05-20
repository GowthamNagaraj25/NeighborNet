const express = require('express');
const router = express.Router();
const { getInitiatives, createInitiative, updateInitiative, updateInitiativeStatus } = require('../controllers/initiativeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getInitiatives);
router.post('/', protect, authorize('organizer', 'admin'), createInitiative);
router.put('/:id', protect, authorize('organizer', 'admin'), updateInitiative);
router.patch('/:id/status', protect, authorize('organizer', 'admin'), updateInitiativeStatus);

module.exports = router;
