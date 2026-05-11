const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  // Store the Neo4j ID or Username in the token
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};