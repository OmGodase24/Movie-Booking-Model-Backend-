const express = require('express');
const movieController = require('../controllers/moviesController');
const authController = require('../controllers/authController');

const router = express.Router();




// Protect all routes and restrict to admins
router.use(authController.protect);  // Ensure token is valid
router.use(authController.restrictTo('admin'));  // Ensure user is admin

router
    .route('/movies')
    .post(movieController.createMovie)
    .get(movieController.getAllMovies);


router
    .route('/movies/:id')
    .get(movieController.getMovie)
    .patch(movieController.updateMovie)
    .delete(movieController.deleteMovie);

// router
//     .route('/movies/search/:moviename')
//     .get(movieController.getMovieByName);

    




module.exports = router;
