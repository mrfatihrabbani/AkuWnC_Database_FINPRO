# Database Performance Benchmarks

## Project: AkuWnC Movie & Series Review Platform

This directory contains performance benchmarks for the dual-database architecture (MongoDB + Neo4j) used in our Letterboxd-style application.

---

## Architecture Overview

| Database | Role | Use Cases |
|----------|------|-----------|
| **MongoDB** | Document Store | Users, Content (Movies/Series), Reviews, Watchlists, Comments, Notifications |
| **Neo4j** | Graph Database | Social relationships (FOLLOWS), Content ratings (RATED), Recommendations, Similar content discovery |

---

## Folder Structure

```
benchmarks/
├── README.md                         # This file
├── scripts/
│   ├── benchmark-mongo.js            # MongoDB performance tests
│   ├── benchmark-neo4j.js            # Neo4j performance tests
│   ├── benchmark-combined.js         # Cross-database operation benchmarks
│   └── generate-plots.js            # Generates HTML chart visualizations
├── results/
│   ├── mongo-results.json            # MongoDB raw results (JSON)
│   ├── mongo-results.csv             # MongoDB raw results (CSV)
│   ├── neo4j-results.json            # Neo4j raw results (JSON)
│   ├── neo4j-results.csv             # Neo4j raw results (CSV)
│   ├── combined-results.json         # Combined operation results (JSON)
│   └── combined-results.csv          # Combined operation results (CSV)
└── plots/
    ├── mongo-operations.html         # MongoDB operation latency chart
    ├── neo4j-operations.html         # Neo4j operation latency chart
    └── comparison-chart.html         # Side-by-side comparison chart
```

---

## Benchmark Categories

### 1. MongoDB Benchmarks (`scripts/benchmark-mongo.js`)
- **CRUD Operations**: Insert, Read (by ID), Update, Delete on Content collection
- **Text Search**: Full-text search across movie titles and directors
- **Aggregation Pipeline**: Average rating by genre (`avgRatingByGenre`)
- **Indexed Queries**: Genre + Type compound index lookups
- **Pagination**: Paginated browse with sort + skip + limit
- **Population/Joins**: Review queries with `.populate()` for user/content references

### 2. Neo4j Benchmarks (`scripts/benchmark-neo4j.js`)
- **Graph Traversal**: Get followers/following (1-hop)
- **Relationship Write**: Follow/Unfollow (MERGE/DELETE relationships)
- **Collaborative Filtering**: Recommendation engine query (multi-hop traversal)
- **Content Similarity**: Genre-based similarity via shared `:TAGGED` relationships
- **Friend Activity Feed**: 2-hop traversal (User → FOLLOWS → Friend → RATED → Movie)

### 3. Combined Benchmarks (`scripts/benchmark-combined.js`)
- **Rate Content Flow**: Write to Neo4j (RATED relationship) + MongoDB (recalculate avgRating)
- **Get User Profile**: MongoDB user lookup + Neo4j follower/following counts
- **Content Detail + Similar**: MongoDB getById + Neo4j getSimilarContent
- **Recommendation Pipeline**: Neo4j recommendations → MongoDB bulk title lookup

---

## How to Run

### Prerequisites
- Node.js >= 18
- MongoDB Atlas connection (configured in `backend/.env`)
- Neo4j Aura connection (configured in `backend/.env`)

### Tutorial

```bash
#  on root
cd benchmarks
npm instal
node scripts/benchmark-mongo.js
node scripts/benchmark-neo4j.js
node scripts/benchmark-combined.js

# now generate the plots
node scripts/generate-plots.js
```

---

## Test Environment ( Ryan's Laptop )

| Parameter | Value |
|-----------|-------|
| **OS** | Windows 11 |
| **Node.js** | v24.14.1 |
| **MongoDB** | Atlas M0 (Free Tier, shared cluster) |
| **Neo4j** | Aura Free Instance |
| **Network** | ~22ms baseline RTT to cloud services |
| **Dataset Size** | 86 content docs, 5 users, 17 reviews, 9 watchlist entries |
| **Iterations per test** | 100 (MongoDB/Neo4j), 50 (Combined) |

---

## Key Findings Summary (Actual Results)

| Operation | MongoDB (median) | Neo4j (median) | Notes |
|-----------|-----------------|----------------|-------|
| Single document/node read | 21.79ms | 23.41ms | Both limited by network RTT |
| Text search ($text index) | 22.01ms | N/A | MongoDB-only feature |
| Social graph traversal (followers) | N/A | 23.11ms | Neo4j native strength |
| Collaborative filtering (recommendations) | ~450ms (estimated with $lookup) | 23.92ms | **Neo4j ~19x faster** |
| Content similarity (shared genres, 2-hop) | N/A | 23.71ms | Graph traversal |
| Aggregation pipeline (avg rating by genre) | 22.78ms | N/A | MongoDB-only feature |
| Write (insert document) | 24.20ms | N/A | MongoDB write |
| Relationship write (follow/unfollow) | N/A | 23.47ms | Neo4j write |
| Population/Join (Review → User + Content) | 43.94ms | N/A | Multiple collections |
| Combined: Rate content (both DBs) | 68.34ms total | — | Neo4j + MongoDB |
| Combined: User profile + social | 103.67ms total | — | MongoDB + 2× Neo4j calls |
| Combined: Recommendation pipeline | 42.42ms total | — | Neo4j CF + MongoDB lookup |
| Combined: Home feed | 84.15ms total | — | Neo4j + 2× MongoDB queries |

---

## Conclusion

The polyglot persistence architecture is justified:
- **MongoDB** excels at document CRUD, text search, and aggregation pipelines (median ~22ms per operation)
- **Neo4j** excels at relationship traversal, collaborative filtering, and path-based queries (median ~23ms per operation)
- **Both databases are network-bound** on free tier cloud instances (~22ms baseline RTT)
- Combined operations range from **42ms to 104ms**, acceptable for a web application
- Neo4j collaborative filtering (23.92ms) vs estimated MongoDB $lookup approach (~450ms) = **~19x speedup**
- The dual-database design leverages each engine's native strengths while keeping total latency under 100ms for most workflows
