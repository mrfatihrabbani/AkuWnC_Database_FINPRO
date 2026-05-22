// combined benchmark - tests stuff that uses both mongo and neo4j together
// run: node scripts/benchmark-combined.js

import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

// schemas (copyed from backend models)

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['movie', 'series'] },
  year: Number,
  director: String,
  genres: [String],
  synopsis: String,
  poster: String,
  runtime: Number,
  language: String,
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  seasons: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

contentSchema.index({ title: 'text', director: 'text' });
contentSchema.index({ type: 1, genres: 1 });

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
  bio: String,
  avatar: String
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  content: String,
  likesCount: { type: Number, default: 0 }
}, { timestamps: true });

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  status: String,
  watchedAt: Date
}, { timestamps: true });

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);

// neo4j driver

let neo4jDriver;

function getNeo4jSession() {
  return neo4jDriver.session();
}

// helpers

const ITERATIONS = 50; // lower cuz each op hits both dbs

async function measureLatency(label, fn) {
  const times = [];

  // warmup
  for (let i = 0; i < 3; i++) {
    await fn();
  }

  // actual timing
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

// combined tests

// rate content - writes to neo4j then recalculates in mongo
async function benchmarkRateContentFlow(username, contentId, contentTitle) {
  return measureLatency('Rate Content Flow (Neo4j write + MongoDB recalc)', async () => {
    // write the rating to neo4j first
    const session = getNeo4jSession();
    try {
      await session.run(
        `MATCH (u:User {username: $username}), (m:Movie {title: $title})
         MERGE (u)-[r:RATED]->(m)
         SET r.score = $score`,
        { username, title: contentTitle, score: 4.5 }
      );
    } finally {
      await session.close();
    }

    // then recalc the avg in mongo
    const reviews = await Review.aggregate([
      { $match: { contentId: new mongoose.Types.ObjectId(contentId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (reviews.length > 0) {
      await Content.findByIdAndUpdate(contentId, {
        avgRating: reviews[0].avg,
        totalRatings: reviews[0].count
      });
    }
  });
}

// user profile page - needs data from both dbs
async function benchmarkUserProfile(username) {
  return measureLatency('User Profile Page (MongoDB user + Neo4j social)', async () => {
    // get user from mongo
    const user = await User.findOne({ username }).select('-password').lean();

    // get social stuff from neo4j
    const session = getNeo4jSession();
    let followingList = [];
    let followersList = [];
    try {
      const followingResult = await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(u:User) RETURN u.username AS username`,
        { username }
      );
      followingList = followingResult.records.map(r => r.get('username'));

      const followersResult = await session.run(
        `MATCH (u:User)-[:FOLLOWS]->(:User {username: $username}) RETURN u.username AS username`,
        { username }
      );
      followersList = followersResult.records.map(r => r.get('username'));
    } finally {
      await session.close();
    }

    // get the counts from mongo
    if (user) {
      await Review.countDocuments({ user: user._id });
      await Watchlist.countDocuments({ user: user._id, status: 'watched' });
    }
  });
}

// content detail page + get similiar content
async function benchmarkContentDetailWithSimilar(contentId, contentTitle) {
  return measureLatency('Content Detail + Similar (MongoDB read + Neo4j traversal)', async () => {
    // grab the movie from mongo
    const content = await Content.findById(contentId).lean();

    // find similiar stuff in neo4j
    const session = getNeo4jSession();
    try {
      await session.run(
        `MATCH (target:Movie {title: $title})-[:TAGGED]->(g:Genre)<-[:TAGGED]-(similar)
         WHERE similar.title <> $title
         RETURN similar.title AS title,
                labels(similar) AS types,
                COLLECT(g.name) AS sharedGenres,
                COUNT(g) AS overlap
         ORDER BY overlap DESC
         LIMIT 8`,
        { title: contentTitle }
      );
    } finally {
      await session.close();
    }
  });
}

// recomendation pipeline - neo4j finds titles then mongo gets the docs
async function benchmarkRecommendationPipeline(username) {
  return measureLatency('Recommendation Pipeline (Neo4j CF + MongoDB bulk lookup)', async () => {
    // get recomendations from neo4j
    const session = getNeo4jSession();
    let recommendedTitles = [];
    try {
      const result = await session.run(
        `MATCH (me:User {username: $username})-[:RATED]->(m)<-[:RATED]-(similar:User)
         WHERE similar.username <> $username
         MATCH (similar)-[r:RATED]->(rec)
         WHERE NOT (me)-[:RATED]->(rec) AND r.score >= 4.0
         RETURN rec.title AS title, COUNT(similar) AS recommendedBy, AVG(r.score) AS avgScore
         ORDER BY recommendedBy DESC, avgScore DESC
         LIMIT 10`,
        { username }
      );
      recommendedTitles = result.records.map(r => r.get('title'));
    } finally {
      await session.close();
    }

    // look them up in mongo
    if (recommendedTitles.length > 0) {
      await Content.find({ title: { $in: recommendedTitles } }).lean();
    }
  });
}

// home feed - gets frend activity and popular stuff
async function benchmarkHomeFeed(username) {
  return measureLatency('Home Feed (Neo4j activity + MongoDB reviews + top-rated)', async () => {
    // what did friends watch
    const session = getNeo4jSession();
    try {
      await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(friend:User)-[r:RATED]->(m:Movie)
         RETURN friend.username AS ratedBy, m.title AS movie, r.score AS score
         ORDER BY r.score DESC
         LIMIT 10`,
        { username }
      );
    } finally {
      await session.close();
    }

    // popular reviews
    await Review.find()
      .populate('user', 'username avatar')
      .populate('contentId', 'title poster')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // top rated movies
    await Content.find({ type: 'movie', totalRatings: { $gte: 1 } })
      .sort({ avgRating: -1 })
      .limit(10)
      .lean();
  });
}

// follow user flow - neo4j relationship + mongo notif lookup
async function benchmarkFollowFlow(fromUsername) {
  return measureLatency('Follow User Flow (Neo4j relationship + MongoDB user lookup)', async () => {
    // follow in neo4j
    const session = getNeo4jSession();
    try {
      await session.run(
        `MERGE (a:User {username: $from})
         MERGE (b:User {username: 'bench_target'})
         MERGE (a)-[:FOLLOWS]->(b)`,
        { from: fromUsername }
      );
    } finally {
      await session.close();
    }

    // find user in mongo for the notification
    await User.findOne({ username: 'rauly' }).select('_id username').lean();
  });
}

// main

async function main() {
  console.log('Combined Benchmark Starting');
  console.log(`Iterations per test: ${ITERATIONS}`);
  console.log('Connecting to MongoDB Atlas + Neo4j Aura...');

  // connect to both dbs
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  neo4jDriver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
  await neo4jDriver.verifyConnectivity();
  console.log('Connected to Neo4j Aura');

  // get sample data to test with
  const sampleContent = await Content.findOne({ type: 'movie', title: 'Interstellar' });
  const sampleUser = await User.findOne({ username: 'fatih' });

  if (!sampleContent || !sampleUser) {
    console.error('No seed data found, run seed scripts first');
    process.exit(1);
  }

  console.log(`Using content: "${sampleContent.title}" (${sampleContent._id})`);
  console.log(`Using user: "${sampleUser.username}"`);

  const results = [];

  const benchmarks = [
    () => benchmarkRateContentFlow(sampleUser.username, sampleContent._id, sampleContent.title),
    () => benchmarkUserProfile(sampleUser.username),
    () => benchmarkContentDetailWithSimilar(sampleContent._id, sampleContent.title),
    () => benchmarkRecommendationPipeline(sampleUser.username),
    () => benchmarkHomeFeed(sampleUser.username),
    () => benchmarkFollowFlow(sampleUser.username),
  ];

  for (const bench of benchmarks) {
    const result = await bench();
    results.push(result);
    console.log(`Done: ${result.operation} - Median: ${result.median_ms}ms, P95: ${result.p95_ms}ms, P99: ${result.p99_ms}ms`);
  }

  // cleanup test stuff
  const cleanupSession = getNeo4jSession();
  try {
    await cleanupSession.run(`MATCH (u:User {username: 'bench_target'}) DETACH DELETE u`);
  } finally {
    await cleanupSession.close();
  }

  // save results to file
  const resultsDir = path.resolve(__dirname, '../results');
  mkdirSync(resultsDir, { recursive: true });

  const jsonOutput = {
    benchmark: 'Combined (Cross-Database) Performance',
    databases: ['MongoDB Atlas (M0 Free Tier)', 'Neo4j Aura (Free Instance)'],
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      os: process.platform,
      iterations: ITERATIONS,
      note: 'Each operation involves network calls to both MongoDB and Neo4j'
    },
    results
  };

  writeFileSync(
    path.join(resultsDir, 'combined-results.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  const csvHeader = 'operation,iterations,min_ms,max_ms,mean_ms,median_ms,p95_ms,p99_ms,std_dev_ms';
  const csvRows = results.map(r =>
    `"${r.operation}",${r.iterations},${r.min_ms},${r.max_ms},${r.mean_ms},${r.median_ms},${r.p95_ms},${r.p99_ms},${r.std_dev_ms}`
  );
  writeFileSync(
    path.join(resultsDir, 'combined-results.csv'),
    [csvHeader, ...csvRows].join('\n')
  );

  console.log('Saved to results/combined-results.json');
  console.log('Saved to results/combined-results.csv');
  console.log('All done');

  await mongoose.disconnect();
  await neo4jDriver.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
