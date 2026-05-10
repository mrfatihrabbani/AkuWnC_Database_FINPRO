import express from 'express';
import cors from 'cors';
import connectMongo from './config/mongo.js';
import { connectNeo4j } from './config/neo4j.js';

// Import Models
import Movie from './models/movie.model.js';
import Review from './models/review.model.js';
import User from './models/user.model.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Connections
const init = async () => {
  await connectMongo();
  await connectNeo4j();
};

init();

// --- API Endpoints ---

// Get Top Rated Movies (For Hero & Just Reviewed Slider)
app.get('/api/movies/top', async (req, res) => {
  try {
    const movies = await Movie.find({ totalRatings: { $gte: 1 } })
      .sort({ avgRating: -1 })
      .limit(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Recent Reviews (For "Popular Reviews This Week")
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

// Get Popular Reviewers
app.get('/api/users/popular', async (req, res) => {
  try {
    const users = await User.find()
      .limit(3);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
