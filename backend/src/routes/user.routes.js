import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Review from '../models/review.model.js';
import User from '../models/user.model.js';
import Watchlist from '../models/watchlist.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads/avatars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.username}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// recent reviews
router.get('/reviews/recent', async (req, res) => {
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

// user profile
router.get('/users/:username/profile', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const reviewCount = await Review.countDocuments({ user: user._id });
    const watchedCount = await Watchlist.countDocuments({ user: user._id, status: 'watched' });

    res.json({
      ...user.toObject(),
      reviewCount,
      watchedCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// user reviews
router.get('/users/:username/reviews', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const reviews = await Review.find({ user: user._id })
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
      .limit(4);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// update profile
router.put('/users/:username/profile', async (req, res) => {
  try {
    const { bio, gender, favoriteGenres } = req.body;
    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (gender !== undefined) update.gender = gender;
    if (favoriteGenres !== undefined) update.favoriteGenres = favoriteGenres;

    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: update },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// upload avatar
router.post('/users/:username/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const avatarUrl = `http://localhost:3001/uploads/avatars/${req.file.filename}`;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// popular users
router.get('/users/popular', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
