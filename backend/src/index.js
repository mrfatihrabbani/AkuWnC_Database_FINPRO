import express from 'express';
import cors from 'cors';
import connectMongo from './config/mongo.js';
import { connectNeo4j } from './config/neo4j.js';

import Movie from './models/movie.model.js';
import Review from './models/review.model.js';
import User from './models/user.model.js';
import Watchlist from './models/watchlist.model.js';
import GraphModel from './models/graph.model.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const init = async () => {
  await connectMongo();
  await connectNeo4j();
};

init();

// routes

app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ title: 1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// top rated
app.get('/api/movies/top', async (req, res) => {
  try {
    const movies = await Movie.getTopRated(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// search
app.get('/api/movies/search', async (req, res) => {
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
app.post('/api/movies/by-titles', async (req, res) => {
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
app.get('/api/movies/genre-stats', async (req, res) => {
  try {
    const stats = await Movie.avgRatingByGenre();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// recent reviews
app.get('/api/reviews/recent', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username avatar')
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
      .limit(4);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// popular users
app.get('/api/users/popular', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// neo4j stuff

app.get('/api/graph/following/:username', async (req, res) => {
  try {
    const following = await GraphModel.getFollowing(req.params.username);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// follow
app.post('/api/graph/follow', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Missing from or to' });
    await GraphModel.follow(from, to);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// recs
app.get('/api/graph/recommendations/:username', async (req, res) => {
  try {
    const recs = await GraphModel.getRecommendations(req.params.username);
    res.json(recs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// friend activity
app.get('/api/graph/friend-activity/:username', async (req, res) => {
  try {
    const activity = await GraphModel.getFriendActivity(req.params.username);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
