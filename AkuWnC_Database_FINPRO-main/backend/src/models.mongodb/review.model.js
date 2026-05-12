import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFirstWatch: { type: Boolean, default: true },
  containsSpoilers: { type: Boolean, default: false },
  replyPrivacy: { type: String, enum: ['Anyone', 'Following', 'Friends'], default: 'Anyone' },
  taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

class ReviewModel {
  
  
  // 1. Fetch by contentId (Movie or Series)
  static async getForContent(contentId) {
    return this.find({ contentId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
  }

  // 2. Fetch Popular Reviews (Highest likes)
  static async getPopular(limit = 5) {
    return this.find()
      .populate('user', 'username avatar')
      .populate('contentId', 'title poster')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(limit);
  }

  // 3. Toggle Like Logic
  static async toggleLike(reviewId, userId) {
    const review = await this.findById(reviewId);
    if (!review) throw new Error("Review not found");

    const isLiked = review.likedBy.includes(userId);
    if (isLiked) {
      review.likedBy.pull(userId);
      review.likesCount = Math.max(0, review.likesCount - 1);
    } else {
      review.likedBy.addToSet(userId);
      review.likesCount += 1;
    }
    return await review.save();
  }


  
  // myReview.isOwner(someUserId)
  isOwner(userId) {
    return this.user.toString() === userId.toString();
  }
}

reviewSchema.loadClass(ReviewModel);

export default mongoose.model('Review', reviewSchema);