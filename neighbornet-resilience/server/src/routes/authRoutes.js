const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, submitVerification, simulateVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validateRequest, register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validateRequest, login);

router.get('/me', protect, getMe);
router.post('/verify', protect, submitVerification);
router.post('/simulate-verify', protect, simulateVerification);

module.exports = router;
