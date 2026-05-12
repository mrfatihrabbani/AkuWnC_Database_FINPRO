import express from 'express';
import { getHeaderNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/header-sync', protect, getHeaderNotifications);

export default router;