// neo4j benchamrk - graph traversal, recommendations, etc
// run: node scripts/benchmark-neo4j.js

import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

// neo4j connection setup

let driver;

function createDriver() {
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
}

function getSession() {
  return driver.session();
}

// helper functions

const ITERATIONS = 100;

async function measureLatency(label, fn) {
  const times = [];

  // warmup so cache is hot
  for (let i = 0; i < 5; i++) {
    await fn();
  }

  // the real mesurements
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

// all the benchmarks

async function benchmarkGetFollowing(username) {
  return measureLatency('Get Following (1-hop traversal)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(u:User)
         RETURN u.username AS username`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkGetFollowers(username) {
  return measureLatency('Get Followers (1-hop reverse traversal)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (u:User)-[:FOLLOWS]->(:User {username: $username})
         RETURN u.username AS username`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkFollowUser() {
  return measureLatency('Follow User (MERGE relationship)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MERGE (a:User {username: 'bench_user_a'})
         MERGE (b:User {username: 'bench_user_b'})
         MERGE (a)-[:FOLLOWS]->(b)`,
        {}
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkUnfollowUser() {
  return measureLatency('Unfollow User (DELETE relationship)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (:User {username: 'bench_user_a'})-[r:FOLLOWS]->(:User {username: 'bench_user_b'})
         DELETE r`,
        {}
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkRateContent(username) {
  return measureLatency('Rate Content (MERGE RATED relationship)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (u:User {username: $username}), (m:Movie {title: 'Interstellar'})
         MERGE (u)-[r:RATED]->(m)
         SET r.score = 4.5`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkCollaborativeFiltering(username) {
  return measureLatency('Collaborative Filtering (Recommendations)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (me:User {username: $username})-[:RATED]->(m)<-[:RATED]-(similar:User)
         WHERE similar.username <> $username
         MATCH (similar)-[r:RATED]->(rec)
         WHERE NOT (me)-[:RATED]->(rec)
           AND r.score >= 4.0
         RETURN rec.title AS title,
                labels(rec) AS types,
                COUNT(similar) AS recommendedBy,
                AVG(r.score) AS avgScore
         ORDER BY recommendedBy DESC, avgScore DESC
         LIMIT 10`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkContentSimilarity() {
  return measureLatency('Content Similarity (shared genres, 2-hop)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (target:Movie {title: 'Interstellar'})-[:TAGGED]->(g:Genre)<-[:TAGGED]-(similar)
         WHERE similar.title <> 'Interstellar'
         RETURN similar.title AS title,
                labels(similar) AS types,
                COLLECT(g.name) AS sharedGenres,
                COUNT(g) AS overlap
         ORDER BY overlap DESC
         LIMIT 8`,
        {}
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkFriendActivity(username) {
  return measureLatency('Friend Activity Feed (2-hop: User→Friend→Movie)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(friend:User)-[r:RATED]->(m:Movie)
         RETURN friend.username AS ratedBy, m.title AS movie, r.score AS score
         ORDER BY r.score DESC
         LIMIT 20`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

async function benchmarkNodeCount() {
  return measureLatency('Count All Nodes (full scan)', async () => {
    const session = getSession();
    try {
      await session.run(`MATCH (n) RETURN count(n) AS total`);
    } finally {
      await session.close();
    }
  });
}

async function benchmarkShortestPath(username) {
  return measureLatency('Shortest Path (between two users)', async () => {
    const session = getSession();
    try {
      await session.run(
        `MATCH (a:User {username: $username}), (b:User {username: 'rauly'})
         MATCH path = shortestPath((a)-[*..6]-(b))
         RETURN length(path) AS distance, [n IN nodes(path) | n.username] AS pathNodes
         LIMIT 1`,
        { username }
      );
    } finally {
      await session.close();
    }
  });
}

// run everthing and save results

async function main() {
  console.log('Neo4j Benchmark Starting');
  console.log(`Iterations per test: ${ITERATIONS}`);
  console.log('Connecting to Neo4j Aura...');

  createDriver();
  await driver.verifyConnectivity();
  console.log('Connected to Neo4j Aura');

  // get a username from the graph to test with
  const session = getSession();
  let sampleUsername = 'fatih';
  try {
    const result = await session.run(`MATCH (u:User) RETURN u.username AS username LIMIT 1`);
    if (result.records.length > 0) {
      sampleUsername = result.records[0].get('username');
    }
  } finally {
    await session.close();
  }

  console.log(`Using user: "${sampleUsername}"`);

  const results = [];

  const benchmarks = [
    () => benchmarkGetFollowing(sampleUsername),
    () => benchmarkGetFollowers(sampleUsername),
    () => benchmarkFollowUser(),
    () => benchmarkUnfollowUser(),
    () => benchmarkRateContent(sampleUsername),
    () => benchmarkCollaborativeFiltering(sampleUsername),
    () => benchmarkContentSimilarity(),
    () => benchmarkFriendActivity(sampleUsername),
    () => benchmarkNodeCount(),
    () => benchmarkShortestPath(sampleUsername),
  ];

  for (const bench of benchmarks) {
    const result = await bench();
    results.push(result);
    console.log(`Done: ${result.operation} - Median: ${result.median_ms}ms, P95: ${result.p95_ms}ms, P99: ${result.p99_ms}ms`);
  }

  // delete the test nodes we made
  const cleanupSession = getSession();
  try {
    await cleanupSession.run(
      `MATCH (u:User) WHERE u.username IN ['bench_user_a', 'bench_user_b'] DETACH DELETE u`
    );
  } finally {
    await cleanupSession.close();
  }

  // save to files
  const resultsDir = path.resolve(__dirname, '../results');
  mkdirSync(resultsDir, { recursive: true });

  // json
  const jsonOutput = {
    benchmark: 'Neo4j Performance',
    database: 'Neo4j Aura (Free Instance)',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      os: process.platform,
      iterations: ITERATIONS,
      driver_version: '6.x'
    },
    results
  };

  writeFileSync(
    path.join(resultsDir, 'neo4j-results.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  // csv
  const csvHeader = 'operation,iterations,min_ms,max_ms,mean_ms,median_ms,p95_ms,p99_ms,std_dev_ms';
  const csvRows = results.map(r =>
    `"${r.operation}",${r.iterations},${r.min_ms},${r.max_ms},${r.mean_ms},${r.median_ms},${r.p95_ms},${r.p99_ms},${r.std_dev_ms}`
  );
  writeFileSync(
    path.join(resultsDir, 'neo4j-results.csv'),
    [csvHeader, ...csvRows].join('\n')
  );

  console.log('Saved to results/neo4j-results.json');
  console.log('Saved to results/neo4j-results.csv');
  console.log('All done');

  await driver.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
