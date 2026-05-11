const express = require('express');
const router = express.Router();
const auth = require('../auth/authMiddleware');
const { postReview, getReviewDetails } = require('../controllers/reviewController');
const { postComment } = require('../controllers/commentController');

router.get('/:reviewId', getReviewDetails);
router.post('/:reviewId/comment', auth, postComment); // Connects to your Comment Model
router.post('/submit', auth, postReview);

module.exports = router;