import { Router } from 'express';
import GraphModel from '../models/graph.model.js';
import User from '../models/user.model.js';

const router = Router();

// get who a user follows
router.get('/following/:username', async (req, res) => {
  try {
    const following = await GraphModel.getFollowing(req.params.username);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// follow someone
router.post('/follow', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Missing from or to' });
    await GraphModel.follow(from, to);

    const fromUser = await User.findOne({ username: from });
    const toUser = await User.findOne({ username: to });
    if (fromUser && toUser) {
      await User.findByIdAndUpdate(fromUser._id, { $addToSet: { following: toUser._id } });
      await User.findByIdAndUpdate(toUser._id, { $addToSet: { followers: fromUser._id } });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// unfollow someone
router.post('/unfollow', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Missing from or to' });
    await GraphModel.unfollow(from, to);

    const fromUser = await User.findOne({ username: from });
    const toUser = await User.findOne({ username: to });
    if (fromUser && toUser) {
      await User.findByIdAndUpdate(fromUser._id, { $pull: { following: toUser._id } });
      await User.findByIdAndUpdate(toUser._id, { $pull: { followers: fromUser._id } });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// recs
router.get('/recommendations/:username', async (req, res) => {
  try {
    const recs = await GraphModel.getRecommendations(req.params.username);
    res.json(recs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// friend activity
router.get('/friend-activity/:username', async (req, res) => {
  try {
    const activity = await GraphModel.getFriendActivity(req.params.username);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
