const express = require('express');
const movieController = require('../controllers/moviesController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect routes
router.use(authController.protect);

// Get all movies
router
    .route('/movies/all')
    .get(movieController.getAllMovies);

// Book tickets for a specific movie
router
    .route('/movies/book/:moviename')
    .post(movieController.bookTicket);

// Cancel a specific ticket for a movie
router
    .route('/movies/cancel/:moviename/:seatNumber')
    .patch(movieController.cancelTicket);

// Get a movie by name
router
    .route('/movies/search/:moviename')
    .get(movieController.getMovieByName);

// You can add more routes here as needed

module.exports = router;
