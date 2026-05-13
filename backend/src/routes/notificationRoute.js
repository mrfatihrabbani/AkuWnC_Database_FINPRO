import express from 'express';
import { getNotificationsByUsername, clearNotificationsByUsername } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:username', getNotificationsByUsername);
router.delete('/:username/clear', clearNotificationsByUsername);

export default router;