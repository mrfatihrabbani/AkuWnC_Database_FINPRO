import Review from '../models/models.mongodb/review.model.js';
import User from '../models/models.mongodb/user.model.js';

/**
 * Create a new review (username-based, no JWT)
 */
export const createReview = async (req, res) => {
  try {
    const { username, contentId, rating, content, isFirstWatch, containsSpoilers } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newReview = await Review.create({
      user: user._id,
      contentId,
      rating,
      content,
      isFirstWatch: isFirstWatch || true,
      containsSpoilers: containsSpoilers || false,
    });

    const populated = await Review.findById(newReview._id)
      .populate('user', 'username avatar')
      .populate('contentId', 'title poster');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Toggle Like on a Review (username-based)
 */
export const handleToggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedReview = await Review.toggleLike(id, user._id);
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reviews for a specific content (Movie/Series)
 */
export const getContentReviews = async (req, res) => {
  try {
    const reviews = await Review.getForContent(req.params.contentId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Popular Reviews (For Dashboard/Sidebar)
 */
export const getPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const reviews = await Review.getPopular(limit);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reviews by a specific user (username-based)
 */
export const getMyReviews = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const reviews = await Review.find({ user: user._id })
      .populate('user', 'username avatar')
      .populate('contentId', 'title poster')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
