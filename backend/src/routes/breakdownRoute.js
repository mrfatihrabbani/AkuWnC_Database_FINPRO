import express from 'express';
import { 
  uploadVideoElement, 
  getVideosByType, 
  getContentSpecificVideos, 
  trackVideoView, 
  handleVideoLike 
} from '../controllers/breakdownController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get overall feeds filtering by type (?type=Breakdown or ?type=Video Essay)
router.get('/', getVideosByType);

// Get videos focusing explicitly on a single specific Movie/Series landing page
router.get('/content/:contentId', getContentSpecificVideos);

// Creator publication submission endpoint
router.post('/', protect, uploadVideoElement);

// View counter reporting path (Triggers on video component playback mount)
router.patch('/:id/view', protect, trackVideoView);

// Like toggling engine
router.post('/:id/like', protect, handleVideoLike);

export default router;