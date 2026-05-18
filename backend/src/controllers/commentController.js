import Comment from '../models/models.mongodb/comment.model.js';
import Review from '../models/models.mongodb/review.model.js';
import Notification from '../models/models.mongodb/notification.model.js';

export const postComment = async (req, res) => {
  try {
    const { profileId, reviewId, text } = req.body;
    const comment = await Comment.create({ review: reviewId, user: profileId, text });

    // notif the review owner if its not their own comment
    const review = await Review.findById(reviewId);
    if (review && review.user.toString() !== profileId) {
      await Notification.addNotification({
        recipientId: review.user,
        type: 'COMMENT',
        message: `${profileId} commented on your review.`,
        relatedId: review._id,
      });
    }

    res.status(201).json({ comment: { id: comment._id, text: comment.text, timestamp: comment.createdAt }, author: comment.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommentsByReview = async (req, res) => {
  try {
    const comments = await Comment.find({ review: req.params.reviewId }).sort({ createdAt: 1 });
    res.status(200).json(comments.map(c => ({ comment: { id: c._id, text: c.text, timestamp: c.createdAt }, author: c.user })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
