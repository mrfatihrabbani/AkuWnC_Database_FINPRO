import express from 'express';
import { getAppDetails, updateAppDetails } from '../controllers/appIngfoController.js';

const router = express.Router();

router.get('/', getAppDetails); // Public Routes, accessible by anyone visiting the About or FAQ pages
router.post('/update', updateAppDetails); // Admin Routes

export default router;