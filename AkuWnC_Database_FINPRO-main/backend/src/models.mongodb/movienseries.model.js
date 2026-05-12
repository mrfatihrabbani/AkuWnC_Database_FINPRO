import mongoose from 'mongoose'

const episodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  episodeNumber: { type: Number, required: true },
  synopsis: { type: String },
  runtime: { type: Number },
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
})

const seasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true },
  episodes: [episodeSchema],
  avgRating: { type: Number, default: 0 } // Calculated from episodes
})

const contentSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    type:         { type: String, enum: ['movie', 'series'], required: true },
    year:         { type: Number, required: true },
    director:     { type: String, required: true }, // Or "Showrunner" for series
    genres:       [{ type: String }],
    synopsis:     { type: String, default: '' },
    poster:       { type: String, default: '' },
    runtime:      { type: Number }, // Total for movies, avg for series
    language:     { type: String, default: 'English' },
    avgRating:    { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    // Series specific
    seasons:      [seasonSchema]
  },
  { timestamps: true }
)

contentSchema.index({ title: 'text', director: 'text' })
contentSchema.index({ type: 1, genres: 1 })
contentSchema.index({ avgRating: -1 })

class ContentModel {
  // Generic search for both types (movies & series)
  static async search(queryString, type = null) {
    const query = { $text: { $search: queryString } };
    if (type) query.type = type;
    return mongoose.model('Content').find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
  }

  static async getByGenre(genre, type = 'movie') {
    return mongoose.model('Content').find({ genres: genre, type })
      .sort({ avgRating: -1 })
  }

  static async getByYear(year) {
    return mongoose.model('Content').find({ year }).sort({ avgRating: -1 })
  }

  static async getById(id) {
    return mongoose.model('Content').findById(id)
  }

  static async getTopRated(type = 'movie', limit = 10) {
    return mongoose.model('Content').find({ type, totalRatings: { $gte: 1 } })
      .sort({ avgRating: -1 })
      .limit(limit)
  }

  static async avgRatingByGenre(type = 'movie') {
    return mongoose.model('Content').aggregate([
      { $match: { type } },
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          avgRating:   { $avg: '$avgRating' },
          totalItems:  { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
    ])
  }

  
   // SPECIAL FOR SERIES: Recalculate Episode -> Season -> Series ratings
  static async recalcSeriesRating(contentId) {
    const Review = mongoose.model('Review');
    const content = await mongoose.model('Content').findById(contentId);
    if (!content || content.type !== 'series') return;

    let totalSeriesRating = 0;
    let totalSeriesReviews = 0;

    // Loop through seasons to update their episode ratings
    for (let s = 0; s < content.seasons.length; s++) {
      let seasonSum = 0;
      let episodesInSeason = content.seasons[s].episodes.length;

      for (let e = 0; e < episodesInSeason; e++) {
        const agg = await Review.aggregate([
          { $match: { 
              contentId: new mongoose.Types.ObjectId(contentId),
              seasonNumber: content.seasons[s].seasonNumber,
              episodeNumber: content.seasons[s].episodes[e].episodeNumber 
          }},
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (agg.length > 0) {
          content.seasons[s].episodes[e].avgRating = agg[0].avg;
          content.seasons[s].episodes[e].totalRatings = agg[0].count;
          seasonSum += agg[0].avg;
          totalSeriesReviews += agg[0].count;
        }
      }
      // Season Avg = average of its episode averages
      content.seasons[s].avgRating = seasonSum / (episodesInSeason || 1);
      totalSeriesRating += content.seasons[s].avgRating;
    }

    // Series Avg = average of season averages
    content.avgRating = totalSeriesRating / (content.seasons.length || 1);
    content.totalRatings = totalSeriesReviews;
    
    await content.save();
  }


static async getPaginated({ type, genre, sortBy, limit = 12 }) {
  const query = {};
  if (type) query.type = type;
  if (genre && genre !== 'All') query.genres = genre;

  let sortQuery = {};
  switch (sortBy) {
    case 'year':
      sortQuery = { year: -1 };
      break;
    case 'rating':
      sortQuery = { avgRating: -1 };
      break;
    case 'title':
    default:
      sortQuery = { title: 1 };
  }

  return mongoose.model('Content').find(query)
    .sort(sortQuery)
    .limit(Number(limit));
}

  // sortedAndFiltered
  // Fetches data already sorted and filtered by the DB
  static async getSortedAndFiltered({ type, genre, sortBy, limit = 100 }) {
    let query = {};
    if (type) query.type = type;
    if (genre && genre !== 'All') query.genres = genre;

    let sortOptions = {};
    switch (sortBy) {
      case 'year':
        sortOptions = { year: -1 };
        break;
      case 'rating':
        sortOptions = { avgRating: -1 };
        break;
      case 'title':
      default:
        sortOptions = { title: 1 };
    }

    return mongoose.model('Content')
      .find(query)
      .sort(sortOptions)
      .limit(limit);
  }

  
  // handleSeeMore 
  static async getPaginated({ type, genre, sortBy, page = 1, perPage = 20 }) {
    let query = {};
    if (type) query.type = type;
    if (genre && genre !== 'All') query.genres = genre;

    let sortOptions = {};
    if (sortBy === 'year') sortOptions = { year: -1 };
    else if (sortBy === 'rating') sortOptions = { avgRating: -1 };
    else sortOptions = { title: 1 };

    const skip = (page - 1) * perPage;

    const items = await mongoose.model('Content')
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(perPage);

    const total = await mongoose.model('Content').countDocuments(query);

    return {
      items,
      total,
      hasNextPage: skip + items.length < total
    };
  }
}

contentSchema.loadClass(ContentModel)
export default mongoose.model('Content', contentSchema)