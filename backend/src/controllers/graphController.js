import GraphModel from '../models/models.neo4j/graph.model.js';
import { notifyNewFollower } from './notificationController.js';
import User from '../models/models.mongodb/user.model.js';

export const getFollowing = async (req, res) => {
  try {
    const following = await GraphModel.getFollowing(req.params.username);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const followers = await GraphModel.getFollowers(req.params.username);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to' });
    }
    await GraphModel.follow(from, to);

    // send notif to the followed user
    const targetUser = await User.findOne({ username: to });
    const followerUser = await User.findOne({ username: from });
    if (targetUser && followerUser) {
      await notifyNewFollower(targetUser._id, from, followerUser._id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to' });
    }
    await GraphModel.unfollow(from, to);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const recs = await GraphModel.getRecommendations(req.params.username);
    res.json(recs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriendActivity = async (req, res) => {
  try {
    const activity = await GraphModel.getFriendActivity(req.params.username);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSimilarMovies = async (req, res) => {
  try {
    const similar = await GraphModel.getSimilarMovies(req.params.movieTitle);
    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rateMovie = async (req, res) => {
  try {
    const { username, movieTitle, score } = req.body;
    if (!username || !movieTitle || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: username, movieTitle, score' });
    }
    await GraphModel.rateMovie(username, movieTitle, score);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};