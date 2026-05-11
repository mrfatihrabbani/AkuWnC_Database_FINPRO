const driver = require('../db');

exports.searchMovies = async (req, res) => {
  const { title } = req.query;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie) WHERE m.title CONTAINS $title 
       RETURN m LIMIT 10`,
      { title }
    );
    const movies = result.records.map(rec => rec.get('m').properties);
    res.json(movies);
  } finally {
    await session.close();
  }
};