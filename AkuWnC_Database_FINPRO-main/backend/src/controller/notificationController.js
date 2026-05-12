import Notification from '../models/notification.model.js';

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

// Request Handler for the Header "Ring" Button
export const getHeaderNotifications = async (req, res) => {
  try {
    // Calling the MongoDB query defined in the Model class
    const notifications = await Notification.getLatestForHeader(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};