import Movie from '../models/models.mongodb/movie.model.js';

export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ title: 1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopRatedMovies = async (req, res) => {
  try {
    const movies = await Movie.getTopRated(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const movies = await Movie.search(q);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMoviesByTitles = async (req, res) => {
  try {
    const { titles } = req.body;
    if (!titles || !Array.isArray(titles)) return res.json([]);
    const movies = await Movie.getManyByTitles(titles);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGenreStats = async (req, res) => {
  try {
    const stats = await Movie.avgRatingByGenre();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};