const express = require('express');
const router = express.Router();
const { getAllUsers, getAllPosts, verifyUser, assignBadge, deletePost } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.patch('/users/:id/verify', verifyUser);
router.patch('/users/:id/badges', assignBadge);
router.delete('/posts/:id', deletePost);

module.exports = router;
