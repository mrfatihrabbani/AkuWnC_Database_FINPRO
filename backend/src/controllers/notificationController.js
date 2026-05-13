import Notification from '../models/models.mongodb/notification.model.js';
import User from '../models/models.mongodb/user.model.js';

// Function 1: Connects to Follower Logic
export const notifyNewFollower = async (targetUserId, followerName, followerId) => {
  return await Notification.addNotification({
    recipientId: targetUserId,
    type: 'NEW_FOLLOWER',
    message: `${followerName} started following you!`,
    relatedId: followerId
  });
};

// Function 2: Connects to Recommendation Logic
export const notifyRecommendation = async (userId, movieTitle, movieId) => {
  return await Notification.addNotification({
    recipientId: userId,
    type: 'RECOMMENDATION',
    message: `Recommendation: ${movieTitle}. Click to view on Dashboard!`,
    relatedId: movieId
  });
};

// Function 3: Connects to Tagging Logic
export const notifyTagInReview = async (taggedUserId, authorName, reviewId) => {
  return await Notification.addNotification({
    recipientId: taggedUserId,
    type: 'TAGGED',
    message: `${authorName} tagged you in a review.`,
    relatedId: reviewId
  });
};

// Request Handler for the Header "Ring" Button (JWT-based)
export const getHeaderNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getLatestForHeader(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Username-based handler (works with current auth system)
export const getNotificationsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const notifications = await Notification.getLatestForHeader(user._id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear all notifications for a user
export const clearNotificationsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Notification.clearAll(user._id);
    res.status(200).json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};