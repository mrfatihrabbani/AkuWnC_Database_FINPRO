const driver = require('../db');

// Add Movie to Watchlist (Creates a Relationship)
exports.addToWatchlist = async (req, res) => {
  const { username, movieId } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {username: $username}), (m:Movie {id: $movieId})
       MERGE (u)-[r:WANTS_TO_WATCH]->(m)
       RETURN r`,
      { username, movieId }
    );
    res.json({ message: "Added to watchlist" });
  } finally {
    await session.close();
  }
};

// Add to Diary (Watched)
exports.addToDiary = async (req, res) => {
  const { username, movieId, dateWatched, rating } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {username: $username}), (m:Movie {id: $movieId})
       CREATE (u)-[r:WATCHED {date: $dateWatched, rating: $rating}]->(m)
       RETURN r`,
      { username, movieId, dateWatched, rating }
    );
    res.json({ message: "Logged in diary" });
  } finally {
    await session.close();
  }
};