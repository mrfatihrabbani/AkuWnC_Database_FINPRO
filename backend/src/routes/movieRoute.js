const express = require('express');
const router = express.Router();
const { getMovie, searchMovies } = require('../controllers/movieController');

router.get('/search', searchMovies);
router.get('/:id', getMovie);

module.exports = router;