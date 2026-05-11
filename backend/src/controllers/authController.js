const driver = require('../db'); 

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (u:User {username: $username, email: $email, password: $password, createdAt: datetime()}) RETURN u',
      { username, email, password }
    );
    res.status(201).json(result.records[0].get('u').properties);
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
};