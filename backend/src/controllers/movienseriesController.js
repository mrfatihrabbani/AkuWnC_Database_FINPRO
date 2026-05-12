<<<<<<< HEAD:backend/src/controllers/movienseriesController.js
import Movie from '../models/models.mongodb/movienseries.model.js';

=======
import Content from '../models.mongodb/movienseries.model.js';
import GraphModel from '../models.neo4j/graph.model.js';

 // Search (Movies or Series)
 // URL: /api/content/search?q=interstellar&type=movie
 
>>>>>>> f7d4fe76e445125d1bab81c53a7b95f65434bbb0:AkuWnC_Database_FINPRO-main/backend/src/controller/movienseriesController.js
export const searchContent = async (req, res) => {
  try {
    const { q, type } = req.query; // type is optional ('movie' or 'series')
    const results = await Content.search(q, type);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 // Get by Genre
 // URL: /api/content/genre/Sci-Fi?type=movie
 
export const getContentByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { type } = req.query; 
    const results = await Content.getByGenre(genre, type || 'movie');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 // Get by Year
 // URL: /api/content/year/2024
 
export const getContentByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const results = await Content.getByYear(year);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 // Get by ID (Detailed Page)
 // URL: /api/content/12345
 
export const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.getById(id);
    if (!content) return res.status(404).json({ message: "Content not found" });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 // Get Top Rated
 // URL: /api/content/top-rated?type=series&limit=5
 
export const getTopRatedContent = async (req, res) => {
  try {
    const { type, limit } = req.query;
    const results = await Content.getTopRated(type || 'movie', parseInt(limit) || 10);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 // Average Rating by Genre (Stats)
 // URL: /api/content/stats/genres?type=series
 
export const getGenreStatistics = async (req, res) => {
  try {
    const { type } = req.query;
    const stats = await Content.avgRatingByGenre(type || 'movie');
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 // Recalculate Series Rating
 // URL: /api/content/recalc/12345
export const refreshSeriesRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    if (content && content.type === 'series') {
      await Content.recalcSeriesRating(id);
      res.status(200).json({ message: "Series ratings rolled up successfully" });
    } else {
      // If it's a movie, you'd call your old recalcRating logic here
      res.status(400).json({ message: "Content is not a series or not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  
 // rateContent (movies & series)
export const handleRating = async (req, res) => {
  try {
    const { contentId, score, title, type } = req.body;
    const username = req.user.username; 

    // Update Graph DB (Neo4j)
    // Map 'movie' -> 'Movie' and 'series' -> 'Series' for Neo4j labels
    const neo4jLabel = type.charAt(0).toUpperCase() + type.slice(1);
    await GraphModel.rateContent(username, title, score, neo4jLabel);

    // Update Document DB (MongoDB)
    // If it's a series, we'd call recalcSeriesRating here
    if (type === 'series') {
      await Content.recalcSeriesRating(contentId);
    } else {
      await Content.recalcRating(contentId); 
    }

    res.status(200).json({ message: "Rating recorded in both systems" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// getRecommendations
// GET /api/content/recommendations
export const getPersonalizedRecs = async (req, res) => {
  try {
    const username = req.user.username;
    const recs = await GraphModel.getRecommendations(username);
    res.status(200).json(recs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// getSimilar
// GET /api/content/similar/:id
export const getSimilarItems = async (req, res) => {
  try {
    const { id } = req.params;
    // We need the title and type from MongoDB first to query Neo4j
    const content = await Content.getById(id);
    if (!content) return res.status(404).json({ message: "Not found" });

    const neo4jLabel = content.type.charAt(0).toUpperCase() + content.type.slice(1);
    const similar = await GraphModel.getSimilarContent(content.title, neo4jLabel);
    
    res.status(200).json(similar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  // Request FetchBrowseContent 
 export const fetchMovies = async (req, res) => {
  try {
    const { type, genre, sortBy, page, perPage } = req.query;

    // Use the paginated model function
    const result = await Content.getPaginated({
      type: type || 'movie',
      genre: genre || 'All',
      sortBy: sortBy || 'title',
      page: parseInt(page) || 1,
      perPage: parseInt(perPage) || 12
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
<<<<<<< HEAD:backend/src/controllers/movienseriesController.js
};
=======
};

>>>>>>> f7d4fe76e445125d1bab81c53a7b95f65434bbb0:AkuWnC_Database_FINPRO-main/backend/src/controller/movienseriesController.js
