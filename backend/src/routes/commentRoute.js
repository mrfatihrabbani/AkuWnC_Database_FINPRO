import express from 'express';
import { postComment, getCommentsByReview } from '../controllers/commentController.js';

const router = express.Router();

router.post('/', postComment);
router.get('/review/:reviewId', getCommentsByReview);

export default router;
