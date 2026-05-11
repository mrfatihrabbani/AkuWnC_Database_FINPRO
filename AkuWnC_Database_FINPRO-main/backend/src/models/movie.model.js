import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    year:         { type: Number, required: true },
    director:     { type: String, required: true },
    genres:       [{ type: String }],
    synopsis:     { type: String, default: '' },
    poster:       { type: String, default: '' },
    runtime:      { type: Number },               
    language:     { type: String, default: 'English' },
    avgRating:    { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
)

movieSchema.index({ title: 'text', director: 'text' })
movieSchema.index({ genres: 1 })
movieSchema.index({ avgRating: -1 })
movieSchema.index({ year: -1 })

class MovieModel {
  static async search(queryString) {
    return mongoose.model('Movie').find(
      { $text: { $search: queryString } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } })
  }

  static async getByGenre(genre) {
    return mongoose.model('Movie').find({ genres: genre })
      .sort({ avgRating: -1 })
  }

  static async getByYear(year) {
    return mongoose.model('Movie').find({ year })
      .sort({ avgRating: -1 })
  }

  static async getById(movieId) {
    return mongoose.model('Movie').findById(movieId)
  }

  static async getByTitle(title) {
    return mongoose.model('Movie').findOne({ title })
  }

  static async getManyByTitles(titles) {
    return mongoose.model('Movie').find({ title: { $in: titles } })
  }

  static async getTopRated(limit = 10) {
    return mongoose.model('Movie').find({ totalRatings: { $gte: 2 } })
      .sort({ avgRating: -1 })
      .limit(limit)
  }

  static async avgRatingByGenre() {
    return mongoose.model('Movie').aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          avgRating:   { $avg: '$avgRating' },
          totalMovies: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
    ])
  }

  static async recalcRating(movieId) {
    const Review = mongoose.model('Review')
    const agg = await Review.aggregate([
      { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    if (agg.length > 0) {
      await mongoose.model('Movie').findByIdAndUpdate(movieId, {
        avgRating:    Math.round(agg[0].avg * 10) / 10,
        totalRatings: agg[0].count,
      })
    }
  }
}

movieSchema.loadClass(MovieModel)
export default mongoose.model('Movie', movieSchema)