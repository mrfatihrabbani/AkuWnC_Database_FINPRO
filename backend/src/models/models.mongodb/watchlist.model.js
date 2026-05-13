import mongoose from 'mongoose'

const watchlistSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    status: {
      type: String,
      enum: ['watched', 'want_to_watch'],
      default: 'want_to_watch',
    },
    watchedAt: { type: Date },
  },
  { timestamps: true }
)

watchlistSchema.index({ user: 1, movie: 1 }, { unique: true })

class WatchlistModel {
  static async getForUser(userId) {
    return mongoose.model('Watchlist').find({ user: userId })
      .populate('movie')
      .sort({ createdAt: -1 })
  }

  static async getWatched(userId) {
    return mongoose.model('Watchlist').find({ user: userId, status: 'watched' })
      .populate('movie', 'title year poster avgRating')
      .sort({ watchedAt: -1 })
  }

  static async getWantToWatch(userId) {
    return mongoose.model('Watchlist').find({ user: userId, status: 'want_to_watch' })
      .populate('movie', 'title year poster')
  }
}

watchlistSchema.loadClass(WatchlistModel)
export default mongoose.model('Watchlist', watchlistSchema)