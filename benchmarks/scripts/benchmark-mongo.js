// mongo benchmark script - tests crud, search, aggregation etc
// run: node scripts/benchmark-mongo.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

// schema definintions (same as backend)

const episodeSchema = new mongoose.Schema({
  title: String,
  episodeNumber: Number,
  synopsis: String,
  runtime: Number,
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
});

const seasonSchema = new mongoose.Schema({
  seasonNumber: Number,
  episodes: [episodeSchema],
  avgRating: { type: Number, default: 0 }
});

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['movie', 'series'], required: true },
  year: Number,
  director: String,
  genres: [String],
  synopsis: String,
  poster: String,
  runtime: Number,
  language: String,
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  seasons: [seasonSchema]
}, { timestamps: true });

contentSchema.index({ title: 'text', director: 'text' });
contentSchema.index({ type: 1, genres: 1 });
contentSchema.index({ avgRating: -1 });

const reviewSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  content: String,
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFirstWatch: Boolean,
  containsSpoilers: Boolean
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
  bio: String,
  avatar: String,
  favoriteGenres: [String],
  gender: String,
  theme: { type: String, default: 'dark' }
}, { timestamps: true });

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  status: { type: String, enum: ['watched', 'want_to_watch'] },
  watchedAt: Date
}, { timestamps: true });

watchlistSchema.index({ user: 1, movie: 1 }, { unique: true });

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);

// utility stuff

const ITERATIONS = 100;

async function measureLatency(label, fn) {
  const times = [];
  
  // warmup first so its not cold
  for (let i = 0; i < 5; i++) {
    await fn();
  }

  // actual mesurement
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  
  return {
    operation: label,
    iterations: ITERATIONS,
    min_ms: parseFloat(times[0].toFixed(3)),
    max_ms: parseFloat(times[times.length - 1].toFixed(3)),
    mean_ms: parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(3)),
    median_ms: parseFloat(times[Math.floor(times.length / 2)].toFixed(3)),
    p95_ms: parseFloat(times[Math.floor(times.length * 0.95)].toFixed(3)),
    p99_ms: parseFloat(times[Math.floor(times.length * 0.99)].toFixed(3)),
    std_dev_ms: parseFloat(Math.sqrt(times.reduce((sum, t) => sum + Math.pow(t - (times.reduce((a, b) => a + b, 0) / times.length), 2), 0) / times.length).toFixed(3))
  };
}

// benchmark tests below

async function benchmarkReadById(contentId) {
  return measureLatency('Read Single Document (findById)', async () => {
    await Content.findById(contentId).lean();
  });
}

async function benchmarkTextSearch() {
  const queries = ['Interstellar', 'Batman', 'Dragon', 'War', 'Animation'];
  let idx = 0;
  return measureLatency('Text Search ($text index)', async () => {
    const q = queries[idx % queries.length];
    idx++;
    await Content.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean();
  });
}

async function benchmarkGetByGenre() {
  const genres = ['Action', 'Drama', 'Comedy', 'Horror', 'Science Fiction'];
  let idx = 0;
  return measureLatency('Indexed Query (genre + type)', async () => {
    const genre = genres[idx % genres.length];
    idx++;
    await Content.find({ genres: genre, type: 'movie' })
      .sort({ avgRating: -1 })
      .lean();
  });
}

async function benchmarkAggregation() {
  return measureLatency('Aggregation Pipeline (avgRatingByGenre)', async () => {
    await Content.aggregate([
      { $match: { type: 'movie' } },
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          avgRating: { $avg: '$avgRating' },
          totalItems: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);
  });
}

async function benchmarkPagination() {
  let page = 1;
  return measureLatency('Paginated Browse (skip + limit + sort)', async () => {
    const skip = ((page % 5) + 1 - 1) * 12;
    page++;
    await Content.find({ type: 'movie' })
      .sort({ title: 1 })
      .skip(skip)
      .limit(12)
      .lean();
  });
}

async function benchmarkPopulate() {
  return measureLatency('Population/Join (Review → User + Content)', async () => {
    await Review.find()
      .populate('user', 'username avatar')
      .populate('contentId', 'title poster')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  });
}

async function benchmarkInsert() {
  const testDocs = [];
  return measureLatency('Insert Single Document', async () => {
    const doc = await Content.create({
      title: `Benchmark Test Movie ${Date.now()}`,
      type: 'movie',
      year: 2024,
      director: 'Test Director',
      genres: ['Action', 'Drama'],
      synopsis: 'A benchmark test document.',
      runtime: 120,
      language: 'English'
    });
    testDocs.push(doc._id);
  });
}

async function benchmarkUpdate(contentId) {
  let counter = 0;
  return measureLatency('Update Single Document (findByIdAndUpdate)', async () => {
    counter++;
    await Content.findByIdAndUpdate(contentId, {
      $set: { synopsis: `Updated synopsis iteration ${counter}` }
    });
  });
}

async function benchmarkCountDocuments() {
  return measureLatency('Count Documents (with filter)', async () => {
    await Content.countDocuments({ type: 'movie', genres: 'Action' });
  });
}

async function benchmarkWatchlistLookup(userId) {
  return measureLatency('Watchlist Lookup (compound index)', async () => {
    await Watchlist.find({ user: userId })
      .populate('movie', 'title year poster avgRating type')
      .sort({ createdAt: -1 })
      .lean();
  });
}

// main function runs evrything

async function main() {
  console.log('MongoDB Benchmark Starting');
  console.log(`Iterations per test: ${ITERATIONS}`);
  console.log('Connecting to MongoDB Atlas...');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  // grab sample data to use for the tests
  const sampleContent = await Content.findOne({ type: 'movie' });
  const sampleUser = await User.findOne();

  if (!sampleContent || !sampleUser) {
    console.error('No seed data found, run npm run seed-mongo first');
    process.exit(1);
  }

  console.log(`Using content: "${sampleContent.title}" (${sampleContent._id})`);
  console.log(`Using user: "${sampleUser.username}" (${sampleUser._id})`);

  const results = [];

  // run them one by one
  const benchmarks = [
    () => benchmarkReadById(sampleContent._id),
    () => benchmarkTextSearch(),
    () => benchmarkGetByGenre(),
    () => benchmarkAggregation(),
    () => benchmarkPagination(),
    () => benchmarkPopulate(),
    () => benchmarkInsert(),
    () => benchmarkUpdate(sampleContent._id),
    () => benchmarkCountDocuments(),
    () => benchmarkWatchlistLookup(sampleUser._id),
  ];

  for (const bench of benchmarks) {
    const result = await bench();
    results.push(result);
    console.log(`Done: ${result.operation} - Median: ${result.median_ms}ms, P95: ${result.p95_ms}ms, P99: ${result.p99_ms}ms`);
  }

  // cleanup the test docs we inserted
  await Content.deleteMany({ title: { $regex: /^Benchmark Test Movie/ } });

  // save everthing to files
  const resultsDir = path.resolve(__dirname, '../results');
  mkdirSync(resultsDir, { recursive: true });

  // json output
  const jsonOutput = {
    benchmark: 'MongoDB Performance',
    database: 'MongoDB Atlas (M0 Free Tier)',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      os: process.platform,
      iterations: ITERATIONS,
      dataset: {
        content_documents: await Content.countDocuments(),
        review_documents: await Review.countDocuments(),
        user_documents: await User.countDocuments(),
        watchlist_documents: await Watchlist.countDocuments()
      }
    },
    results
  };

  writeFileSync(
    path.join(resultsDir, 'mongo-results.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  // csv output
  const csvHeader = 'operation,iterations,min_ms,max_ms,mean_ms,median_ms,p95_ms,p99_ms,std_dev_ms';
  const csvRows = results.map(r =>
    `"${r.operation}",${r.iterations},${r.min_ms},${r.max_ms},${r.mean_ms},${r.median_ms},${r.p95_ms},${r.p99_ms},${r.std_dev_ms}`
  );
  writeFileSync(
    path.join(resultsDir, 'mongo-results.csv'),
    [csvHeader, ...csvRows].join('\n')
  );

  console.log('Saved to results/mongo-results.json');
  console.log('Saved to results/mongo-results.csv');
  console.log('All done');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
