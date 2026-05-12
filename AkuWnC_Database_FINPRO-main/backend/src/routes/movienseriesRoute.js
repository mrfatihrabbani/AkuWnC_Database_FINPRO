import express from 'express';
import { fetchBrowseContent } from '../controllers/movienseriesController.js';
const router = express.Router();
const { getMovie, searchMovies } = require('../controllers/movieController');

router.get('/search', searchMovies);
router.get('/:id', getMovie);
router.get('/browse', fetchBrowseContent);


export default router;