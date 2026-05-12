import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { postReview, getReviewDetails } from '../controllers/reviewController.js';
import { postComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:reviewId', getReviewDetails);
router.post('/:reviewId/comment', authMiddleware, postComment);
router.post('/submit', authMiddleware, postReview);

export default router;