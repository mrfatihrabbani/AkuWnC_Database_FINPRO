import Watchlist from '../models/models.mongodb/watchlist.model.js';
import User from '../models/models.mongodb/user.model.js';
import Content from '../models/models.mongodb/movienseries.model.js';

export const addToWatchlist = async (req, res) => {
  try {
    const { username, contentId, status } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const entry = await Watchlist.findOneAndUpdate(
      { user: user._id, movie: contentId },
      { status: status || 'watched', watchedAt: status === 'watched' ? new Date() : undefined },
      { upsert: true, returnDocument: 'after' }
    );
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { username, contentId } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Watchlist.findOneAndDelete({ user: user._id, movie: contentId });
    res.status(200).json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const items = await Watchlist.find({ user: user._id })
      .populate('movie', 'title year poster avgRating type')
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWatchlistStatus = async (req, res) => {
  try {
    const { username, contentId } = req.query;
    const user = await User.findOne({ username });
    if (!user) return res.status(200).json(null);

    const entry = await Watchlist.findOne({ user: user._id, movie: contentId });
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
