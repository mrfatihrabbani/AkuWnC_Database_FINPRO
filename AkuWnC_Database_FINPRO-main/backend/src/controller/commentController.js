const Comment = require('../models.neo4j/comment.model');

exports.postComment = async (req, res) => {
  try {
    const { profileId, reviewId, text, rating } = req.body;
    
    // Instantiate the model
    const newComment = new Comment(text, profileId, reviewId, rating);
    
    // Save to Neo4j
    const savedData = await newComment.save();
    
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};