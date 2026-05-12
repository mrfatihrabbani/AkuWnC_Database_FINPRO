import express from 'express';
import { 
  createReview, 
  handleToggleLike, 
  getContentReviews, 
  getPopular, 
  getMyReviews 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js'; // Hypothetical auth guard

const router = express.Router();


// PUBLIC ROUTES
// Fetch popular reviews for the landing page
router.get('/popular', getPopular);

// Fetch reviews for a specific movie or series
router.get('/content/:contentId', getContentReviews);

// PROTECTED ROUTES (Require Login)
router.post('/', protect, createReview);
router.post('/:id/like', protect, handleToggleLike);
router.get('/me', protect, getMyReviews);

export default router;