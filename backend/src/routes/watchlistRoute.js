import express from 'express';
import { addToWatchlist, removeFromWatchlist, getWatchlist, getWatchlistStatus } from '../controllers/watchlistController.js';

const router = express.Router();

router.get('/status', getWatchlistStatus);
router.get('/:username', getWatchlist);
router.post('/add', addToWatchlist);
router.post('/remove', removeFromWatchlist);

export default router;
