import User from '../models/models.mongodb/user.model.js';
import Review from '../models/models.mongodb/review.model.js';
import GraphModel from '../models/models.neo4j/graph.model.js';
import Watchlist from '../models/models.mongodb/watchlist.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'letterboxd-avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }]
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadAvatar = upload.single('avatar');

export const getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username avatar')
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
      .limit(4);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')

    if (!user) return res.status(404).json({ error: 'User not found' });

    const followingUsernames = await GraphModel.getFollowing(req.params.username);
    const followersUsernames = await GraphModel.getFollowers(req.params.username);

    const following = await User.find({ username: { $in: followingUsernames } })
      .select('username avatar bio');
    const followers = await User.find({ username: { $in: followersUsernames } })
      .select('username avatar bio');

    const reviewCount = await Review.countDocuments({ user: user._id });
    const watchedCount = await Watchlist.countDocuments({ user: user._id, status: 'watched' });
    
    res.json({ ...user.toObject(), following: following, followers: followers, reviewCount, watchedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const avatarUrl = req.file.path;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const reviews = await Review.find({ user: user._id })
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
      .limit(4);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPopularUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};