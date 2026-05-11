const driver = require('/db');

exports.postReview = async (req, res) => {
  const { username, movieId, reviewText } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {username: $username}), (m:Movie {id: $movieId})
       CREATE (u)-[:WROTE]->(r:Review {text: $reviewText, date: datetime()})-[:ABOUT]->(m)
       RETURN r`,
      { username, movieId, reviewText }
    );
    res.status(201).json({ message: "Review posted" });
  } finally {
    await session.close();
  }
};