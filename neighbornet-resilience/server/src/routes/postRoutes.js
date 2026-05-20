const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getPosts, getPostById, createPost, updatePost, deletePost,
  updatePostStatus, getMyPosts, getNearbyPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const postValidation = [
  body('type').isIn(['request', 'offer']).withMessage('Type must be request or offer'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
];

router.get('/my-posts', protect, getMyPosts);
router.get('/nearby', protect, getNearbyPosts);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, postValidation, validateRequest, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, updatePostStatus);

module.exports = router;
