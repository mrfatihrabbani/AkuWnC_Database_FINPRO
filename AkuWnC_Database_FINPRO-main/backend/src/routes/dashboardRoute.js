const express = require('express');
const router = express.Router();
const auth = require('../auth/authMiddleware');

router.get('/feed', auth, async (req, res) => {
    // Controller logic would go here to fetch:
    // MATCH (u:User {id: $userId})-[:FOLLOWS]->(friend)-[:WATCHED]->(m:Movie)
    // RETURN friend, m ORDER BY m.date DESC
});

module.exports = router;