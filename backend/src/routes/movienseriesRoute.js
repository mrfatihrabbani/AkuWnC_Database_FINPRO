import express from 'express';
import {
  searchContent,
  getContentByGenre,
  getContentByYear,
  getContentById,
  getTopRatedContent,
  getGenreStatistics,
  refreshSeriesRatings,
  handleRating,
  getPersonalizedRecs,
  getSimilarItems,
  fetchMovies,
  getByTitles,
} from '../controllers/movienseriesController.js';

const router = express.Router();

router.get('/search', searchContent);
router.get('/top-rated', getTopRatedContent);
router.get('/stats/genres', getGenreStatistics);
router.get('/recommendations', getPersonalizedRecs);
router.get('/browse', fetchMovies);
router.get('/genre/:genre', getContentByGenre);
router.get('/year/:year', getContentByYear);
router.get('/similar/:id', getSimilarItems);
router.get('/recalc/:id', refreshSeriesRatings);
router.get('/:id', getContentById);
router.post('/rate', handleRating);
router.post('/by-titles', getByTitles);

export default router;