import express from 'express';
import { getAllMovies, getTopRatedMovies, searchMovies, getMoviesByTitles, getGenreStats } from '../controllers/movienseriesController.js';

const router = express.Router();


router.get('/', getAllMovies);
router.get('/top', getTopRatedMovies);
router.get('/search', searchMovies);
router.post('/by-titles', getMoviesByTitles);
router.get('/genre-stats', getGenreStats);
router.get('/browse', fetchBrowseContent);

export default router;