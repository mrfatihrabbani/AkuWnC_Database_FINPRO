import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    movie:   { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    rating:  { type: Number, required: true, min: 0.5, max: 5 },
    content: { type: String, default: '' },
    liked:   { type: Boolean, default: false },
  },
  { timestamps: true }
)

reviewSchema.index({ user: 1, movie: 1 }, { unique: true })
reviewSchema.index({ movie: 1 })
reviewSchema.index({ user: 1 })

class ReviewModel {
  static async getForMovie(movieId) {
    return mongoose.model('Review').find({ movie: movieId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
  }

  static async getByUser(userId) {
    return mongoose.model('Review').find({ user: userId })
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
  }

  static async getSocialFeed(followingIds) {
    return mongoose.model('Review').find({ user: { $in: followingIds } })
      .populate('user',  'username avatar')
      .populate('movie', 'title year poster')
      .sort({ createdAt: -1 })
      .limit(30)
  }
}

reviewSchema.loadClass(ReviewModel)
export default mongoose.model('Review', reviewSchema)