import { Router } from 'express';
import Movie from '../models/movie.model.js';

const router = Router();

// all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ title: 1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// top rated
router.get('/top', async (req, res) => {
  try {
    const movies = await Movie.getTopRated(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// search
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const movies = await Movie.search(q);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// batch fetch by titles
router.post('/by-titles', async (req, res) => {
  try {
    const { titles } = req.body;
    if (!titles || !Array.isArray(titles)) return res.json([]);
    const movies = await Movie.getManyByTitles(titles);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// genre stats
router.get('/genre-stats', async (req, res) => {
  try {
    const stats = await Movie.avgRatingByGenre();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
