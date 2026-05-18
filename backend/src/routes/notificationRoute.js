import express from 'express';
import { getNotificationsByUsername, clearNotificationsByUsername, markNotificationRead } from '../controllers/notificationController.js';

const router = express.Router();

router.patch('/:id/read', markNotificationRead);
router.get('/:username', getNotificationsByUsername);
router.delete('/:username/clear', clearNotificationsByUsername);

export default router;