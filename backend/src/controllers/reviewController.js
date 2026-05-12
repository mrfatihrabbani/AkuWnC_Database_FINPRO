import driver from '../config/neo4j.js';

/**
 * Create a new review
 * Triggered by the "Post Review" button on your frontend
 */
export const createReview = async (req, res) => {
  try {
    const { 
      contentId, rating, content, isFirstWatch, 
      containsSpoilers, replyPrivacy, taggedUsers 
    } = req.body;

    // We create the review using the standard Mongoose create
    const newReview = await Review.create({
      user: req.user.id, // Derived from Auth Middleware
      contentId,
      rating,
      content,
      isFirstWatch,
      containsSpoilers,
      replyPrivacy,
      taggedUsers
    });

    // CRITICAL: Trigger the rating recalculation in the Content model
    // This ensures the movie/series average rating stays updated
    if (newReview) {
      await Content.recalcRating(contentId);
    }

    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Toggle Like on a Review
 * Calls Review.toggleLike from your class methods
 */
export const handleToggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updatedReview = await Review.toggleLike(id, userId);
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reviews for a specific content (Movie/Series)
 */
export const getContentReviews = async (req, res) => {
  try {
    const reviews = await Review.getForContent(req.params.contentId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Popular Reviews (For Dashboard/Sidebar)
 */
export const getPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const reviews = await Review.getPopular(limit);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


