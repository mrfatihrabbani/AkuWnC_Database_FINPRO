import express from 'express';
import { getFollowing, getFollowers, followUser, unfollowUser, getRecommendations, getFriendActivity, getSimilarMovies, rateMovie } from '../controllers/graphController.js';

const router = express.Router();

router.get('/following/:username', getFollowing);
router.get('/followers/:username', getFollowers);
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);
router.get('/recommendations/:username', getRecommendations);
router.get('/friend-activity/:username', getFriendActivity);
router.get('/similar/:movieTitle', getSimilarMovies);
router.post('/rate', rateMovie);

export default router;