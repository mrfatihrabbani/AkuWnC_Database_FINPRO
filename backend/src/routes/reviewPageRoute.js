import express from 'express';
import { 
  createReview, 
  handleToggleLike, 
  getContentReviews, 
  getPopular, 
  getMyReviews 
} from '../controllers/reviewController.js';

const router = express.Router();

// Popular reviews for dashboard
router.get('/popular', getPopular);

// Reviews for a specific movie/series
router.get('/content/:contentId', getContentReviews);

// Reviews by a specific user
router.get('/user/:username', getMyReviews);

// Create a review (username in body)
router.post('/', createReview);

// Toggle like (username in body)
router.post('/:id/like', handleToggleLike);

export default router;