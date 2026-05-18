import express from 'express';
import { getRecentReviews, getUserProfile, updateUserProfile, getUserReviews, getPopularUsers, uploadAvatar, updateAvatar, updateTheme } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/reviews/recent', getRecentReviews);
router.get('/users/popular', getPopularUsers);
router.put('/users/theme', protect, updateTheme);
router.get('/users/:username/profile', getUserProfile);
router.put('/users/:username/profile', updateUserProfile);
router.get('/users/:username/reviews', getUserReviews);
router.post('/users/:username/avatar', uploadAvatar, updateAvatar);

export default router;